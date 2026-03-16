import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad",
};

export default function PrivacidadPage() {
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
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: Febrero 2026
        </p>

        <div className="mt-8 prose prose-neutral max-w-none text-muted-foreground text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. Información que recopilamos
            </h2>
            <p>
              Recopilamos información que usted nos proporciona directamente al
              registrarse, como su nombre, dirección de correo electrónico y
              datos de su institución educativa. También recopilamos información
              de uso del servicio de forma automática.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Uso de la información
            </h2>
            <p>
              Utilizamos la información recopilada para proporcionar, mantener y
              mejorar nuestros servicios, procesar pagos, enviar notificaciones
              relacionadas con el servicio y responder a consultas de soporte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Seguridad de los datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger sus datos, incluyendo encriptación TLS en tránsito y Row
              Level Security (RLS) para el aislamiento de datos por institución.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Contacto
            </h2>
            <p>
              Si tiene preguntas sobre esta política de privacidad, puede
              contactarnos en{" "}
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
