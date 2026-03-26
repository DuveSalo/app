import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardForm } from '@/features/auth/components/CardForm';
import { toast } from 'sonner';

interface ChangeCardFormProps {
  onTokenReady: (cardTokenId: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * Wraps the shared CardForm in compact mode for the change-card flow.
 * Only collects card number, expiration, CVV and cardholder name.
 * Calls onTokenReady with the card token ID after tokenization.
 */
export const ChangeCardForm = ({ onTokenReady, onCancel }: ChangeCardFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleTokenReady = async (data: { token: string }) => {
    setError('');
    setIsProcessing(true);
    try {
      await onTokenReady(data.token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar la tarjeta.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <CardForm
        amount={0}
        compact
        submitLabel="Actualizar tarjeta"
        onTokenReady={handleTokenReady}
        onError={(msg) => setError(msg)}
        isProcessing={isProcessing}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="button" variant="ghost" onClick={onCancel} disabled={isProcessing}>
        Cancelar
      </Button>
    </div>
  );
};
