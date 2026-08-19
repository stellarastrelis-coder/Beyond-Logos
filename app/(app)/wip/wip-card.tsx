"use client";

import { useTransition } from "react";
import { WIP_STAGES } from "@/lib/types";
import type { WipItem, WipStage } from "@/lib/types";
import { setWipStage, deleteWipItem } from "./actions";

export default function WipCard({ item }: { item: WipItem }) {
  const [isPending, startTransition] = useTransition();
  const currentIndex = WIP_STAGES.findIndex((s) => s.value === item.stage);

  function handleSetStage(stage: WipStage) {
    startTransition(() => {
      setWipStage(item.id, stage);
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-neutral-900">{item.name}</p>
          {item.notes && <p className="text-sm text-neutral-500">{item.notes}</p>}
        </div>
        <button
          onClick={() => startTransition(() => deleteWipItem(item.id))}
          className="shrink-0 text-xs text-neutral-400 hover:text-red-600"
        >
          Hapus
        </button>
      </div>

      <div className="mt-4 flex items-center gap-1">
        {WIP_STAGES.map((stage, i) => {
          const done = i <= currentIndex;
          return (
            <button
              key={stage.value}
              disabled={isPending}
              onClick={() => handleSetStage(stage.value)}
              title={stage.label}
              className="flex flex-1 flex-col items-center gap-1 disabled:opacity-50"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                  done
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`text-center text-[10px] leading-tight ${
                  done ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
