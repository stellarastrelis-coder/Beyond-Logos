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
        className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <div className="min-w-[160px] flex-1">
          <label className="block text-xs font-medium text-neutral-600">Nama produk</label>
          <input
            name="name"
            defaultValue={item.name}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-neutral-600">Harga</label>
          <input
            name="price"
            type="number"
            min={0}
            step={500}
            defaultValue={item.price}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-neutral-600">Qty</label>
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={item.quantity}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-neutral-600">
            Ganti gambar (opsional)
          </label>
          <input name="image" type="file" accept="image/*" className="mt-1 w-full text-xs" />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
        >
          Batal
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1">
        <p className="font-medium text-neutral-900">{item.name}</p>
        <p className="text-sm text-neutral-500">
          {formatRupiah(item.price)} &middot; Stok {item.quantity}
        </p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700"
      >
        Edit
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => deleteStockItem(item.id))}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-500 hover:text-red-600 disabled:opacity-50"
      >
        Hapus
      </button>
    </div>
  );
}
