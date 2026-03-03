"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { APP_ROUTES } from "@/lib/landing-constants";

const NAV_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg border-b border-neutral-200/80"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center transition-colors rounded-md ${
                scrolled
                  ? "bg-neutral-900 text-white"
                  : "bg-white/10 text-white ring-1 ring-white/20"
              }`}
            >
              <span className="text-[10px] font-bold">ES</span>
            </div>
            <span
              className={`text-sm font-semibold transition-colors ${
                scrolled ? "text-neutral-900" : "text-white"
              }`}
            >
              Escuela Segura
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-neutral-500 hover:text-neutral-900"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={APP_ROUTES.LOGIN}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-neutral-500 hover:text-neutral-900"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Iniciar sesión
            </a>
            <Button
              asChild
              size="sm"
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 rounded-md text-sm"
            >
              <a href={APP_ROUTES.REGISTER}>Comenzar gratis</a>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-md transition-colors ${
              scrolled
                ? "text-neutral-700 hover:bg-neutral-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 px-2 rounded-md hover:bg-neutral-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-neutral-100 my-2" />
            <a
              href={APP_ROUTES.LOGIN}
              className="block text-sm font-medium text-neutral-500 py-2 px-2"
            >
              Iniciar sesión
            </a>
            <Button
              asChild
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-sm"
            >
              <a href={APP_ROUTES.REGISTER}>Comenzar gratis</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
