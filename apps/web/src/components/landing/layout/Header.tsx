"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/landing";

const NAV_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground rounded-lg">
              <span className="text-xs font-bold">ES</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Escuela Segura</span>
          </a>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <a href={APP_ROUTES.LOGIN}>Iniciar sesión</a>
            </Button>
            <Button asChild>
              <a href={APP_ROUTES.REGISTER}>Comenzar gratis</a>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-6 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg py-2 px-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border my-2" />
            <Button variant="ghost" asChild className="w-full justify-start">
              <a href={APP_ROUTES.LOGIN}>Iniciar sesión</a>
            </Button>
            <Button asChild className="w-full">
              <a href={APP_ROUTES.REGISTER}>Comenzar gratis</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
