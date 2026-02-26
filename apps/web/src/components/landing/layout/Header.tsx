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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-warm-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                scrolled
                  ? "bg-brand-700 text-white"
                  : "bg-white/10 text-white ring-1 ring-white/20"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className={`text-lg font-semibold font-[family-name:var(--font-heading)] transition-colors ${
                scrolled ? "text-warm-900" : "text-white"
              }`}
            >
              Escuela Segura
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-warm-600 hover:text-warm-900"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={APP_ROUTES.LOGIN}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-warm-600 hover:text-warm-900"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Iniciar sesión
            </a>
            <Button
              asChild
              className="rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-5 shadow-sm"
            >
              <a href={APP_ROUTES.REGISTER}>Comenzar gratis</a>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled
                ? "text-warm-700 hover:bg-warm-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-warm-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-warm-700 hover:text-warm-900 py-2"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-warm-200" />
            <a
              href={APP_ROUTES.LOGIN}
              className="block text-sm font-medium text-warm-600 py-2"
            >
              Iniciar sesión
            </a>
            <Button
              asChild
              className="w-full rounded-lg bg-brand-700 hover:bg-brand-800 text-white shadow-sm"
            >
              <a href={APP_ROUTES.REGISTER}>Comenzar gratis</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
