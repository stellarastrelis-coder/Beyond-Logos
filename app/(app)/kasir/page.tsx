import { createClient } from "@/lib/supabase/server";
import type { StockItem, Transaction, TransactionItem } from "@/lib/types";
import KasirClient from "./kasir-client";
import TransactionHistory from "./transaction-history";

export default async function KasirPage() {
  const supabase = await createClient();

  const { data: stockItems } = await supabase
    .from("stock_items")
    .select("*, profiles:member_id(id, display_name)")
    .order("name");

  const { data: settings } = await supabase
    .from("app_settings")
    .select("qr_image_url")
    .single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, profiles:handled_by(id, display_name), transaction_items(*)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-lg font-semibold text-neutral-900">Kasir</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Pilih produk, checkout, lalu tunjukkan QR ke pembeli.
      </p>

      <KasirClient
        items={(stockItems ?? []) as StockItem[]}
        qrImageUrl={settings?.qr_image_url ?? null}
      />

      <TransactionHistory
        transactions={
          (transactions ?? []) as (Transaction & { transaction_items: TransactionItem[] })[]
        }
      />
    </div>
  );
}
