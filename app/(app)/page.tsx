import { createClient } from "@/lib/supabase/server";
import type { StockItem } from "@/lib/types";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: stockItems } = await supabase
    .from("stock_items")
    .select("*, profiles:member_id(id, display_name)")
    .order("name");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .order("display_name");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-800">Pricelist Circle</h1>
      <p className="mt-1 text-sm text-muted">
        Semua produk dari semua anggota, lengkap dengan harga dan sisa stok.
      </p>
      <DashboardClient
        items={(stockItems ?? []) as StockItem[]}
        members={profiles ?? []}
      />
    </div>
  );
}
