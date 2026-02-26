import Link from "next/link";
import { Button } from "@/components/landing/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-brand-600 font-[family-name:var(--font-mono)]">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-warm-900 font-[family-name:var(--font-heading)]">
        Página no encontrada
      </h1>
      <p className="mt-2 text-warm-500">
        La página que busca no existe o fue movida.
      </p>
      <Button asChild className="mt-6 rounded-md bg-brand-600 hover:bg-brand-700 text-white">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
