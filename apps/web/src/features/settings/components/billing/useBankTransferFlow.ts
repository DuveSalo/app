import { useState, useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import * as api from '@/lib/api/services';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { BankTransferStep, BankPaymentStatus } from './BankTransferDialog';

interface UseBankTransferFlowOptions {
  companyId: string;
  onSubscriptionChange: () => Promise<void>;
  onConfirmPayment: (planKey: string, amount: number) => Promise<void>;
}

export interface BankTransferFlowState {
  step: BankTransferStep;
  uploadFile: File | null;
  paymentStatus: BankPaymentStatus | null;
  rejectionReason: string | null;
  isProcessing: boolean;
  setUploadFile: (file: File | null) => void;
  reset: () => void;
  handleConfirmDetails: (planKey: string, amount: number) => Promise<void>;
  handleUploadSubmit: () => Promise<void>;
  retryUpload: () => void;
}

export const useBankTransferFlow = ({
  companyId,
  onSubscriptionChange,
  onConfirmPayment,
}: UseBankTransferFlowOptions): BankTransferFlowState => {
  const [step, setStep] = useState<BankTransferStep>('details');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<BankPaymentStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const reset = () => {
    setStep('details');
    setUploadFile(null);
    setPaymentStatus(null);
    setRejectionReason(null);
  };

  // Realtime subscription + fallback poll for payment status
  useEffect(() => {
    if (step !== 'status' || !companyId) return;

    const poll = async () => {
      try {
        const payment = await api.getLatestManualPayment(companyId);
        if (!payment) return;
        setPaymentStatus(payment.status as BankPaymentStatus);
        setRejectionReason(payment.rejectionReason ?? null);
      } catch {
        // Silently ignore poll errors
      }
    };

    poll();

    channelRef.current = supabase
      .channel(`billing-bank-transfer:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'manual_payments',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          poll();
        }
      )
      .subscribe();

    pollIntervalRef.current = setInterval(poll, 60_000);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [step, companyId]);

  // Stop polling on terminal status; auto-close on approval
  useEffect(() => {
    if (paymentStatus === 'approved' || paymentStatus === 'rejected') {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
    if (paymentStatus === 'approved') {
      autoCloseRef.current = setTimeout(async () => {
        reset();
        await onSubscriptionChange();
      }, 3000);
      return () => {
        if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      };
    }
  }, [paymentStatus, onSubscriptionChange]);

  const handleConfirmDetails = async (planKey: string, amount: number) => {
    setIsProcessing(true);
    try {
      await onConfirmPayment(planKey, amount);
      setStep('upload');
    } catch {
      // Error already toasted by hook
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setIsProcessing(true);
    try {
      const payment = await api.getLatestManualPayment(companyId);
      if (!payment) {
        toast.error('No se encontró un pago pendiente.');
        return;
      }
      await api.uploadReceipt({ companyId, paymentId: payment.id, file: uploadFile });
      toast.success('Comprobante enviado correctamente');
      setPaymentStatus('pending');
      setStep('status');
    } catch {
      toast.error('Error al enviar el comprobante.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    step,
    uploadFile,
    paymentStatus,
    rejectionReason,
    isProcessing,
    setUploadFile,
    reset,
    handleConfirmDetails,
    handleUploadSubmit,
    retryUpload: () => setStep('upload'),
  };
};
