"use client";

import { useTransition } from "react";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { Profile, Transaction, TransactionItem } from "@/lib/types";
import { voidTransaction } from "./actions";

type TransactionWithItems = Transaction & {
  transaction_items: TransactionItem[];
  profiles?: Pick<Profile, "id" | "display_name"> | null;
};

export default function TransactionHistory({
  transactions,
}: {
  transactions: TransactionWithItems[];
}) {
  const [isPending, startTransition] = useTransition();

  if (transactions.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-neutral-900">Riwayat Transaksi</h2>
      <div className="mt-3 flex flex-col gap-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className={`rounded-xl border p-4 ${
              tx.voided_at
                ? "border-neutral-200 bg-neutral-50 opacity-60"
                : "border-neutral-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {formatRupiah(tx.total)}{" "}
                  {tx.voided_at && (
                    <span className="ml-1 text-xs font-normal text-red-600">(dibatalkan)</span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatDateTime(tx.created_at)} &middot; oleh {tx.profiles?.display_name}
                </p>
                <ul className="mt-2 text-xs text-neutral-500">
                  {tx.transaction_items.map((line) => (
                    <li key={line.id}>
                      {line.quantity}x {line.name_snapshot}
                    </li>
                  ))}
                </ul>
              </div>
              {!tx.voided_at && (
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => {
                      void voidTransaction(tx.id);
                    })
                  }
                  className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  Batalkan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
