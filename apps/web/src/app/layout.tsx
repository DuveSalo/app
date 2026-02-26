import type { Metadata } from "next";
import { heading, body, mono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://escuelasegura.com"),
  title: {
    default:
      "Escuela Segura | Gestión de Cumplimiento de Seguridad para Escuelas",
    template: "%s | Escuela Segura",
  },
  description:
    "Centralice certificados, inspecciones y vencimientos de seguridad de su escuela. Alertas automáticas, dashboard de cumplimiento y preparación de auditorías en minutos.",
  keywords: [
    "seguridad escolar",
    "cumplimiento normativo escuelas",
    "certificados de seguridad",
    "gestión de matafuegos",
    "vencimientos escuelas",
    "auditoría escolar",
    "software escuelas argentina",
  ],
  authors: [{ name: "Escuela Segura" }],
  creator: "Escuela Segura",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://escuelasegura.com",
    siteName: "Escuela Segura",
    title:
      "Escuela Segura | Gestión de Cumplimiento de Seguridad para Escuelas",
    description:
      "Centralice certificados, inspecciones y vencimientos de seguridad. Alertas automáticas y dashboard de cumplimiento.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Escuela Segura - Dashboard de cumplimiento de seguridad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Escuela Segura | Gestión de Seguridad Escolar",
    description:
      "Centralice certificados, inspecciones y vencimientos. Alertas automáticas.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Escuela Segura",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "25000",
    highPrice: "89000",
    priceCurrency: "ARS",
    offerCount: 3,
  },
  description:
    "Plataforma de gestión de cumplimiento de seguridad para escuelas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${heading.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
