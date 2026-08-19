"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  image: File,
): Promise<string | null> {
  if (!image || image.size === 0) return null;

  const ext = image.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, image, { contentType: image.type });

  if (error) return null;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function addStockItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const quantity = Number(formData.get("quantity") ?? 0);
  const image = formData.get("image") as File | null;

  if (!name || price < 0 || quantity < 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const imageUrl = image ? await uploadImage(supabase, user.id, image) : null;

  await supabase.from("stock_items").insert({
    member_id: user.id,
    name,
    price,
    quantity,
    image_url: imageUrl,
  });

  revalidatePath("/stock");
  revalidatePath("/");
}

export async function updateStockItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const quantity = Number(formData.get("quantity") ?? 0);
  const image = formData.get("image") as File | null;

  if (!id || !name || price < 0 || quantity < 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const update: Record<string, unknown> = {
    name,
    price,
    quantity,
    updated_at: new Date().toISOString(),
  };

  if (image && image.size > 0) {
    const imageUrl = await uploadImage(supabase, user.id, image);
    if (imageUrl) update.image_url = imageUrl;
  }

  await supabase.from("stock_items").update(update).eq("id", id);

  revalidatePath("/stock");
  revalidatePath("/");
}

export async function deleteStockItem(id: string) {
  const supabase = await createClient();
  await supabase.from("stock_items").delete().eq("id", id);

  revalidatePath("/stock");
  revalidatePath("/");
}
