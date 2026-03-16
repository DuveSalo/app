import { useState } from 'react';
import { Building2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BANK_DETAILS = [
  { label: 'Banco', value: 'Banco Nación Argentina' },
  { label: 'Titular', value: 'Escuela Segura SRL' },
  { label: 'CBU', value: '0110599940059901234567' },
  { label: 'Alias', value: 'ESCUELA.SEGURA.PAGOS' },
  { label: 'CUIT', value: '30-71234567-8' },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copiado al portapapeles`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar al portapapeles');
    }
  };

  return (
    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}

export function BankDetailsCard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Datos bancarios</span>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex flex-col gap-3">
          {BANK_DETAILS.map((detail) => (
            <div key={detail.label} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{detail.label}</span>
                <span className="text-sm font-medium text-foreground">{detail.value}</span>
              </div>
              <CopyButton value={detail.value} label={detail.label} />
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Realiza la transferencia desde tu banco y luego subi el comprobante en el siguiente paso.
      </p>
    </div>
  );
}
