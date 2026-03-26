import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PasswordInput } from '@/components/common/PasswordInput';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import AuthLayout from '@/components/layout/AuthLayout';
import { ROUTE_PATHS } from '@/constants/index';
import * as api from '@/lib/api/services';
import { supabase } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schemas';

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Enlace inválido o expirado', {
          description: 'Solicitá un nuevo enlace para restablecer tu contraseña.',
        });
        navigate(ROUTE_PATHS.LOGIN, { replace: true });
      } else {
        setSessionChecked(true);
      }
    });
  }, [navigate]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await api.changePassword(values.newPassword);
      toast.success('Contraseña actualizada correctamente');
      navigate(ROUTE_PATHS.LOGIN, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la contraseña.';
      toast.error('Error', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionChecked) return null;

  return (
    <AuthLayout variant="split">
      <Card className="w-full max-w-[440px]">
        <CardContent className="p-8 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
              <KeyRound className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Nueva contraseña
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Ingresá tu nueva contraseña para restablecer el acceso a tu cuenta.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="--------"
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="--------"
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
              </p>

              <Button type="submit" loading={isLoading} className="w-full mt-6">
                {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
