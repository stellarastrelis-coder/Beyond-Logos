-- Circle Booth Comifuro - initial schema
-- Run this whole file once in the Supabase SQL Editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create type wip_stage as enum ('draft', 'warna', 'test_print', 'mass_production');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create a profile row whenever a member account is added in
-- Authentication > Users. display_name comes from the "display_name" user
-- metadata field if set when creating the user, otherwise falls back to the
-- part of the email before the @.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- wip_items (private per member)
-- ---------------------------------------------------------------------------
create table public.wip_items (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  notes text,
  stage wip_stage not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wip_items enable row level security;

create policy "members manage own wip only"
  on public.wip_items for all
  to authenticated
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

-- ---------------------------------------------------------------------------
-- stock_items (readable by everyone, editable by owner)
-- ---------------------------------------------------------------------------
create table public.stock_items (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  image_url text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stock_items enable row level security;

create policy "stock viewable by all members"
  on public.stock_items for select
  to authenticated
  using (true);

create policy "owner inserts own stock"
  on public.stock_items for insert
  to authenticated
  with check (member_id = auth.uid());

create policy "owner updates own stock"
  on public.stock_items for update
  to authenticated
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "owner deletes own stock"
  on public.stock_items for delete
  to authenticated
  using (member_id = auth.uid());

-- ---------------------------------------------------------------------------
-- transactions / transaction_items (kasir history, viewable by all members)
-- writes only happen through the RPC functions below (security definer),
-- so there are intentionally no insert/update policies on these two tables.
-- ---------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  total numeric(12, 2) not null default 0,
  handled_by uuid not null references public.profiles (id),
  voided_at timestamptz
);

alter table public.transactions enable row level security;

create policy "transactions viewable by all members"
  on public.transactions for select
  to authenticated
  using (true);

create table public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  stock_item_id uuid references public.stock_items (id) on delete set null,
  item_owner_id uuid not null references public.profiles (id),
  name_snapshot text not null,
  price_snapshot numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  subtotal numeric(12, 2) not null
);

alter table public.transaction_items enable row level security;

create policy "transaction items viewable by all members"
  on public.transaction_items for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- app_settings (singleton row, holds the static payment QR image URL)
-- ---------------------------------------------------------------------------
create table public.app_settings (
  id boolean primary key default true check (id),
  qr_image_url text
);

insert into public.app_settings (id, qr_image_url) values (true, null);

alter table public.app_settings enable row level security;

create policy "settings viewable by all members"
  on public.app_settings for select
  to authenticated
  using (true);

create policy "settings updatable by any member"
  on public.app_settings for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- checkout_transaction: atomically validates stock, records the sale and
-- decrements stock. Runs as a single DB transaction so two kasir devices
-- checking out at the same time can never oversell an item.
-- cart shape: [{ "stock_item_id": "<uuid>", "quantity": 2 }, ...]
-- ---------------------------------------------------------------------------
create or replace function public.checkout_transaction(cart jsonb)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_transaction_id uuid;
  v_total numeric(12, 2) := 0;
  v_item jsonb;
  v_stock record;
  v_qty integer;
  v_subtotal numeric(12, 2);
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if cart is null or jsonb_array_length(cart) = 0 then
    raise exception 'Cart is empty';
  end if;

  -- Lock every row involved first so concurrent checkouts serialize instead
  -- of racing each other, and validate there is enough stock for all lines
  -- before writing anything.
  for v_item in select * from jsonb_array_elements(cart)
  loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Invalid quantity in cart';
    end if;

    select * into v_stock from public.stock_items
      where id = (v_item ->> 'stock_item_id')::uuid
      for update;

    if not found then
      raise exception 'Stock item not found';
    end if;

    if v_stock.quantity < v_qty then
      raise exception 'Insufficient stock for %', v_stock.name;
    end if;
  end loop;

  insert into public.transactions (handled_by, total)
    values (auth.uid(), 0)
    returning id into v_transaction_id;

  for v_item in select * from jsonb_array_elements(cart)
  loop
    v_qty := (v_item ->> 'quantity')::integer;

    select * into v_stock from public.stock_items
      where id = (v_item ->> 'stock_item_id')::uuid;

    v_subtotal := v_stock.price * v_qty;
    v_total := v_total + v_subtotal;

    insert into public.transaction_items
      (transaction_id, stock_item_id, item_owner_id, name_snapshot, price_snapshot, quantity, subtotal)
    values
      (v_transaction_id, v_stock.id, v_stock.member_id, v_stock.name, v_stock.price, v_qty, v_subtotal);

    update public.stock_items
      set quantity = quantity - v_qty, updated_at = now()
      where id = v_stock.id;
  end loop;

  update public.transactions set total = v_total where id = v_transaction_id;

  return v_transaction_id;
end;
$$;

grant execute on function public.checkout_transaction(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- void_transaction: marks a transaction as voided and restores stock
-- quantities for each of its line items.
-- ---------------------------------------------------------------------------
create or replace function public.void_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_item record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.transactions
    where id = p_transaction_id and voided_at is null
  ) then
    raise exception 'Transaction not found or already voided';
  end if;

  for v_item in
    select * from public.transaction_items where transaction_id = p_transaction_id
  loop
    if v_item.stock_item_id is not null then
      update public.stock_items
        set quantity = quantity + v_item.quantity, updated_at = now()
        where id = v_item.stock_item_id;
    end if;
  end loop;

  update public.transactions set voided_at = now() where id = p_transaction_id;
end;
$$;

grant execute on function public.void_transaction(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets for product photos and the static payment QR image
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-qr', 'payment-qr', true)
on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "members upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "members update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "members delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

create policy "public read payment qr"
  on storage.objects for select
  using (bucket_id = 'payment-qr');

create policy "members upload payment qr"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-qr');

create policy "members update payment qr"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'payment-qr');
