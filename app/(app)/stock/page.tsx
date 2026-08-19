import { createClient } from "@/lib/supabase/server";
import type { StockItem } from "@/lib/types";
import StockForm from "./stock-form";
import StockRow from "./stock-row";

export default async function StockPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("stock_items")
    .select("*")
    .eq("member_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-lg font-semibold text-neutral-900">Stok Saya</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Produk yang kamu jual di booth. Otomatis muncul di pricelist gabungan dan kasir.
      </p>

      <StockForm />

      {!items || items.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Belum ada produk.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {(items as StockItem[]).map((item) => (
            <StockRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
