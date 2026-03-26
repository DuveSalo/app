import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/lib/auth/AuthContext';
import { changeEmailSchema, type ChangeEmailFormValues } from './schemas';

const ChangeEmailPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    mode: 'onBlur',
    defaultValues: { newEmail: '' },
  });

  const handleSubmit = async (values: ChangeEmailFormValues) => {
    try {
      await api.changeEmail(values.newEmail);
      setSubmittedEmail(values.newEmail);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al solicitar el cambio de email.';
      toast.error('Error', { description: message });
    }
  };

  if (submittedEmail) {
    return (
      <AuthLayout variant="split">
        <Card className="w-full max-w-[440px]">
          <CardContent className="p-8 flex flex-col gap-5 items-center text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Revisá tu nuevo email
            </h2>
            <p className="text-sm text-muted-foreground">
              Te enviamos un enlace de confirmación a{' '}
              <strong className="text-foreground">{submittedEmail}</strong>. Hacé clic en el enlace
              para confirmar tu nuevo email.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(ROUTE_PATHS.SETTINGS)}
            >
              Volver a configuración
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="split">
      <Card className="w-full max-w-[440px]">
        <CardContent className="p-8 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Cambiar email
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Tu email actual es{' '}
              <strong className="text-foreground">{currentUser?.email}</strong>. Ingresá el nuevo
              email al que querés cambiar.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuevo email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nuevo@email.com"
                        autoComplete="email"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                Enviar confirmación
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate(ROUTE_PATHS.SETTINGS)}
              >
                Cancelar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ChangeEmailPage;
