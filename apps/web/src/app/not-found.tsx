import Link from "next/link";
import { Button } from "@/components/landing/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-neutral-800 font-[family-name:var(--font-mono)]">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">
        Página no encontrada
      </h1>
      <p className="mt-2 text-neutral-500">
        La página que busca no existe o fue movida.
      </p>
      <Button asChild className="mt-6 bg-neutral-900 hover:bg-neutral-800 text-white">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
