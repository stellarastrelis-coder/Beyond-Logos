"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";
import type { StockItem } from "@/lib/types";

export default function DashboardClient({
  items,
  members,
}: {
  items: StockItem[];
  members: { id: string; display_name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesOwner = owner === "all" || item.member_id === owner;
      return matchesSearch && matchesOwner;
    });
  }, [items, search, owner]);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        >
          <option value="all">Semua anggota</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Belum ada produk yang cocok.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <div className="aspect-square w-full bg-neutral-100">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    Tanpa gambar
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                <p className="text-xs text-neutral-500">{item.profiles?.display_name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatRupiah(item.price)}
                  </span>
                  <span
                    className={`text-xs ${
                      item.quantity > 0 ? "text-neutral-500" : "text-red-600"
                    }`}
                  >
                    {item.quantity > 0 ? `Stok ${item.quantity}` : "Habis"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
