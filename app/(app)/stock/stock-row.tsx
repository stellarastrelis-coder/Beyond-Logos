"use client";

import { useState, useTransition } from "react";
import { formatRupiah } from "@/lib/format";
import type { StockItem } from "@/lib/types";
import { deleteStockItem, updateStockItem } from "./actions";

export default function StockRow({ item }: { item: StockItem }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleUpdate(formData: FormData) {
    formData.set("id", item.id);
    startTransition(async () => {
      await updateStockItem(formData);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <form
        action={handleUpdate}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-100/50"
      >
        <div className="min-w-[160px] flex-1">
          <label className="block text-xs font-medium text-muted">Nama produk</label>
          <input
            name="name"
            defaultValue={item.name}
            required
            className="mt-1 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-muted">Harga</label>
          <input
            name="price"
            type="number"
            min={0}
            step={500}
            defaultValue={item.price}
            required
            className="mt-1 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-muted">Qty</label>
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={item.quantity}
            required
            className="mt-1 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-muted">Ganti gambar (opsional)</label>
          <input name="image" type="file" accept="image/*" className="mt-1 w-full text-xs" />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="brand-gradient rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-300/40 disabled:opacity-50"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-xl border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
        >
          Batal
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-100/50">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1">
        <p className="font-medium text-ink">{item.name}</p>
        <p className="text-sm text-muted">
          {formatRupiah(item.price)} &middot; Stok {item.quantity}
        </p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="rounded-full border border-brand-200 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
      >
        Edit
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => deleteStockItem(item.id))}
        className="rounded-full border border-brand-200 px-3 py-1.5 text-sm text-muted hover:text-red-600 disabled:opacity-50"
      >
        Hapus
      </button>
    </div>
  );
}
