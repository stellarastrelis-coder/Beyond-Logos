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
      className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-100/50"
    >
      <div className="min-w-[160px] flex-1">
        <label className="block text-xs font-medium text-muted">Nama produk</label>
        <input
          name="name"
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
          required
          className="mt-1 w-full rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div className="min-w-[180px]">
        <label className="block text-xs font-medium text-muted">Gambar</label>
        <input name="image" type="file" accept="image/*" className="mt-1 w-full text-xs" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-300/40 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Tambah"}
      </button>
    </form>
  );
}
