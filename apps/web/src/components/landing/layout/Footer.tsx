import { APP_ROUTES } from "@/constants/landing";

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
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground rounded-lg">
                <span className="text-xs font-bold">ES</span>
              </div>
              <span className="text-sm font-semibold text-foreground">Escuela Segura</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Plataforma integral para la gestión de seguridad, documentación y cumplimiento
              normativo en instituciones educativas.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Escuela Segura. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">Hecho en Argentina</p>
        </div>
      </div>
    </footer>
  );
}
