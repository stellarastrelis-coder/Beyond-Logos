import { createClient } from "@/lib/supabase/server";
import type { WipItem } from "@/lib/types";
import { addWipItem } from "./actions";
import WipCard from "./wip-card";

export default async function WipPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("wip_items")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-800">WIP Tracker</h1>
      <p className="mt-1 text-sm text-muted">
        Progress merch kamu sendiri. Item di sini privat, member lain tidak bisa lihat.
      </p>

      <form
        action={addWipItem}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-100/50"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-muted">Nama item</label>
          <input
            name="name"
            required
            placeholder="misal: Acrylic Stand A"
            className="mt-1 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-muted">Catatan (opsional)</label>
          <input
            name="notes"
            placeholder="misal: nunggu vendor cetak"
            className="mt-1 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <button
          type="submit"
          className="brand-gradient rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-300/40"
        >
          Tambah
        </button>
      </form>

      {!items || items.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Belum ada item WIP.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(items as WipItem[]).map((item) => (
            <WipCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
