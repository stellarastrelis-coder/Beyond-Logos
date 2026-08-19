import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

type TxRow = {
  id: string;
  created_at: string;
  transaction_items: { item_owner_id: string; quantity: number; subtotal: number }[];
};

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const isToday = range === "today";

  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("id, created_at, transaction_items(item_owner_id, quantity, subtotal)")
    .is("voided_at", null)
    .order("created_at", { ascending: false });

  if (isToday) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    query = query.gte("created_at", startOfDay.toISOString());
  }

  const { data: transactions } = await query;
  const { data: profiles } = await supabase.from("profiles").select("id, display_name");

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const totals = new Map<string, { itemsSold: number; revenue: number }>();
  let grandTotal = 0;

  for (const tx of (transactions ?? []) as TxRow[]) {
    for (const line of tx.transaction_items) {
      const current = totals.get(line.item_owner_id) ?? { itemsSold: 0, revenue: 0 };
      current.itemsSold += line.quantity;
      current.revenue += line.subtotal;
      totals.set(line.item_owner_id, current);
      grandTotal += line.subtotal;
    }
  }

  const rows = [...totals.entries()].sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <div>
      <h1 className="text-lg font-semibold text-neutral-900">Laporan Penjualan</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Rekap item terjual dan pendapatan per anggota (transaksi yang dibatalkan tidak dihitung).
      </p>

      <div className="mt-4 flex gap-2">
        <Link
          href="/laporan"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            !isToday ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-600"
          }`}
        >
          Semua waktu
        </Link>
        <Link
          href="/laporan?range=today"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            isToday ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-600"
          }`}
        >
          Hari ini
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Belum ada penjualan.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Anggota</th>
                <th className="px-4 py-2 font-medium">Item Terjual</th>
                <th className="px-4 py-2 text-right font-medium">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([ownerId, stats]) => (
                <tr key={ownerId} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {nameById.get(ownerId) ?? "Tidak diketahui"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{stats.itemsSold}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {formatRupiah(stats.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 bg-neutral-50">
                <td className="px-4 py-3 font-semibold text-neutral-900" colSpan={2}>
                  Total
                </td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                  {formatRupiah(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
