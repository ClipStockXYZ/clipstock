import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Connect } from "@/components/connect";
import { ClipMark } from "@/components/clip-mark";
import { TapeRibbon } from "@/components/tape-ribbon";
import { GH_URL, LINE, TG_URL, TOKEN_TICKER } from "@/lib/catalog";

const NAV = [
  { to: "/", label: "Desk" },
  { to: "/claim", label: "Claim" },
  { to: "/paper", label: "Paper" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <ClipMark className="h-9 w-9" />
            <span className="font-display text-2xl font-semibold tracking-tight">ClipStock</span>
          </Link>
          <nav className="ml-2 hidden items-center gap-1 text-sm text-mute sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-3 py-1.5 hover:bg-paper hover:text-ink"
                activeProps={{ className: "rounded-full bg-paper px-3 py-1.5 text-ink" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a href={GH_URL} target="_blank" rel="noreferrer" className="hidden px-2 text-sm text-mute hover:text-ink sm:inline">
              Git
            </a>
            <a href={TG_URL} target="_blank" rel="noreferrer" className="hidden px-2 text-sm text-mute hover:text-ink sm:inline">
              TG
            </a>
            <Connect />
          </div>
        </div>
        <TapeRibbon />
      </header>
      <nav className="flex gap-2 overflow-x-auto px-4 py-2 text-sm sm:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="rounded-full border border-line bg-paper px-3 py-1.5"
            activeProps={{ className: "rounded-full bg-forest px-3 py-1.5 text-forest-fg" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-5xl px-4 pb-12 pt-4 text-sm text-mute">
        <p>
          ${TOKEN_TICKER} · {LINE}
        </p>
        <p className="mt-2 flex flex-wrap gap-3">
          <a className="hover:text-ink" href={GH_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-ink" href={TG_URL} target="_blank" rel="noreferrer">
            Telegram
          </a>
        </p>
      </footer>
    </div>
  );
}
