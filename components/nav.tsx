"use client";

import Image from "next/image";
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
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/mascot-icon.png" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-lg font-semibold tracking-tight text-brand-800">
            Beyond Logos
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "brand-gradient text-white shadow-sm shadow-brand-300/50"
                    : "text-muted hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{displayName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-brand-200 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
