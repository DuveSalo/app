import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Servicio",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <Link
          href="/"
          className="text-sm text-foreground hover:text-foreground font-medium"
        >
          &larr; Volver al inicio
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-foreground">
          Términos de Servicio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: Febrero 2026
        </p>

        <div className="mt-8 prose prose-neutral max-w-none text-muted-foreground text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. Aceptación de los términos
            </h2>
            <p>
              Al acceder o utilizar Escuela Segura, usted acepta estar sujeto a
              estos Términos de Servicio. Si no está de acuerdo con alguna parte
              de los términos, no podrá acceder al servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Descripción del servicio
            </h2>
            <p>
              Escuela Segura es una plataforma web de gestión de cumplimiento de
              seguridad para instituciones educativas. Permite centralizar
              documentación, gestionar vencimientos y recibir alertas
              automáticas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Cuentas y suscripciones
            </h2>
            <p>
              Al crear una cuenta, usted es responsable de mantener la seguridad
              de su cuenta y de toda la actividad que ocurra bajo ella. Las
              suscripciones se facturan mensualmente a través de MercadoPago.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Prueba gratuita
            </h2>
            <p>
              Ofrecemos una prueba gratuita de 14 días con acceso completo a
              todas las funcionalidades. No se requieren datos de pago para
              iniciar la prueba. Al finalizar, podrá elegir un plan pago para
              continuar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos, contáctenos en{" "}
              <a
                href="mailto:contacto@escuelasegura.com"
                className="text-foreground hover:text-foreground"
              >
                contacto@escuelasegura.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
