"use client";

import { useState } from "react";
import { nav } from "@/lib/data";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-offwhite/90 backdrop-blur border-b border-navy/10">
      <div className="max-w-content mx-auto section-pad flex items-center justify-between h-16 sm:h-20">
        <a href="#home" className="font-display text-lg sm:text-xl text-navy tracking-tightish">
          Mirza Asif Iqbal
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-charcoal hover:text-gold transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/admin/login"
            className="text-sm border border-navy/30 text-navy px-4 py-2 hover:border-gold hover:text-gold transition-colors"
          >
            Admin Login
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
        >
          <span
            className={`block h-px w-6 bg-navy transition-transform ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-navy transition-opacity ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-px w-6 bg-navy transition-transform ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="lg:hidden border-t border-navy/10 bg-offwhite">
          <div className="max-w-content mx-auto section-pad py-4 flex flex-col gap-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base text-charcoal hover:text-gold transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="text-base text-navy border border-navy/30 px-4 py-2 w-fit"
            >
              Admin Login
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
