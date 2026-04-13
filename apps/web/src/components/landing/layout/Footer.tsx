import { Shield } from 'lucide-react';
import { APP_ROUTES } from '@/constants/landing';

const FOOTER_LINKS = {
  Producto: [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Precios', href: '#precios' },
    { label: 'Prueba Gratuita', href: APP_ROUTES.REGISTER },
  ],
  Contacto: [{ label: 'contacto@escuelasegura.com', href: 'mailto:contacto@escuelasegura.com' }],
  Legal: [
    { label: 'Términos de Servicio', href: '/terminos' },
    { label: 'Política de Privacidad', href: '/privacidad' },
  ],
} as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-foreground">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fafafa 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative circle */}
      <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full border border-white/[0.04]" />

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center bg-white/15 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Escuela Segura</span>
            </div>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Plataforma integral para la gestión de seguridad, documentación y cumplimiento
              normativo en instituciones educativas.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
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
        <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            &copy; {new Date().getFullYear()} Escuela Segura. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/35 flex items-center gap-1.5">Hecho en Argentina</p>
        </div>
      </div>
    </footer>
  );
}
