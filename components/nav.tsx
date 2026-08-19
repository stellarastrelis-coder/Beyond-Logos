"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(app)/actions";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/wip", label: "WIP" },
  { href: "/stock", label: "Stok" },
  { href: "/kasir", label: "Kasir" },
  { href: "/laporan", label: "Laporan" },
  { href: "/settings", label: "Settings" },
];

export default function Nav({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">{displayName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
