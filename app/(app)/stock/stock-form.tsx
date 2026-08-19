"use client";

import { useRef, useState } from "react";
import { addStockItem } from "./actions";

export default function StockForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    await addStockItem(formData);
    setPending(false);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <div className="min-w-[160px] flex-1">
        <label className="block text-xs font-medium text-neutral-600">Nama produk</label>
        <input
          name="name"
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
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>
      <div className="min-w-[180px]">
        <label className="block text-xs font-medium text-neutral-600">Gambar</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="mt-1 w-full text-xs"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Tambah"}
      </button>
    </form>
  );
}
