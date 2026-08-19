"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";
import type { StockItem } from "@/lib/types";
import { checkout } from "./actions";

type CartEntry = { item: StockItem; quantity: number };

export default function KasirClient({
  items,
  qrImageUrl,
}: {
  items: StockItem[];
  qrImageUrl: string | null;
}) {
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [search, setSearch] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidTotal, setPaidTotal] = useState<number | null>(null);

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const total = useMemo(
    () => Object.values(cart).reduce((sum, c) => sum + c.item.price * c.quantity, 0),
    [cart],
  );

  function addToCart(item: StockItem) {
    setCart((prev) => {
      const existing = prev[item.id];
      const nextQty = (existing?.quantity ?? 0) + 1;
      if (nextQty > item.quantity) return prev;
      return { ...prev, [item.id]: { item, quantity: nextQty } };
    });
  }

  function changeQty(itemId: string, delta: number) {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const rest = { ...prev };
        delete rest[itemId];
        return rest;
      }
      if (nextQty > existing.item.quantity) return prev;
      return { ...prev, [itemId]: { ...existing, quantity: nextQty } };
    });
  }

  async function handleCheckout() {
    setError(null);
    setCheckingOut(true);
    const result = await checkout(
      Object.values(cart).map((c) => ({ stock_item_id: c.item.id, quantity: c.quantity })),
    );
    setCheckingOut(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setPaidTotal(total);
    setCart({});
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => {
            const inCart = cart[item.id]?.quantity ?? 0;
            const soldOut = item.quantity <= 0;
            return (
              <button
                key={item.id}
                disabled={soldOut || inCart >= item.quantity}
                onClick={() => addToCart(item)}
                className="rounded-2xl border border-brand-100 bg-white p-3 text-left shadow-sm shadow-brand-100/50 transition-shadow hover:shadow-md hover:shadow-brand-200/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted">{item.profiles?.display_name}</p>
                <p className="mt-1 text-sm font-semibold text-brand-700">
                  {formatRupiah(item.price)}
                </p>
                <p className="text-xs text-brand-300">
                  {soldOut ? "Habis" : `Stok ${item.quantity - inCart}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-100/50">
        <h2 className="font-display text-base font-semibold text-brand-800">Keranjang</h2>
        {Object.keys(cart).length === 0 ? (
          <p className="mt-3 text-sm text-muted">Belum ada item dipilih.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {Object.values(cart).map(({ item, quantity }) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <div className="flex-1">
                  <p className="truncate font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-muted">{formatRupiah(item.price)}</p>
                </div>
                <button
                  onClick={() => changeQty(item.id, -1)}
                  className="h-6 w-6 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50"
                >
                  -
                </button>
                <span className="w-4 text-center">{quantity}</span>
                <button
                  onClick={() => changeQty(item.id, 1)}
                  className="h-6 w-6 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-3">
          <span className="text-sm font-medium text-muted">Total</span>
          <span className="brand-gradient-text text-lg font-semibold">{formatRupiah(total)}</span>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={checkingOut || Object.keys(cart).length === 0}
          className="brand-gradient mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-300/40 disabled:opacity-50"
        >
          {checkingOut ? "Memproses..." : "Checkout"}
        </button>
      </div>

      {paidTotal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <p className="text-sm text-muted">Total tagihan</p>
            <p className="brand-gradient-text mt-1 text-3xl font-semibold">
              {formatRupiah(paidTotal)}
            </p>
            <div className="mt-4 flex justify-center">
              {qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrImageUrl} alt="QR pembayaran" className="h-64 w-64 object-contain" />
              ) : (
                <p className="text-sm text-muted">
                  QR pembayaran belum diupload. Atur di menu Settings.
                </p>
              )}
            </div>
            <button
              onClick={() => setPaidTotal(null)}
              className="brand-gradient mt-4 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-300/40"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
