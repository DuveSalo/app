import { APP_ROUTES } from "@/lib/landing-constants";

const FOOTER_LINKS = {
  Producto: [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Precios", href: "#precios" },
    { label: "Prueba Gratuita", href: APP_ROUTES.REGISTER },
  ],
  Empresa: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Contacto", href: "mailto:contacto@escuelasegura.com" },
  ],
  Legal: [
    { label: "Términos de Servicio", href: "/terminos" },
    { label: "Política de Privacidad", href: "/privacidad" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="bg-warm-900 text-warm-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
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
              <span className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
                Escuela Segura
              </span>
            </div>
            <p className="text-sm leading-relaxed text-warm-500 max-w-xs">
              Plataforma integral para la gestión de seguridad, documentación y
              cumplimiento normativo en instituciones educativas.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4 font-[family-name:var(--font-heading)]">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-warm-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-warm-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warm-600">
            &copy; {new Date().getFullYear()} Escuela Segura. Todos los
            derechos reservados.
          </p>
          <p className="text-xs text-warm-600">Hecho en Argentina</p>
        </div>
      </div>
    </footer>
  );
}
