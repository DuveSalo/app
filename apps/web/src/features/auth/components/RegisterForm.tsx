import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Card, CardContent } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
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
import { registerSchema, otpSchema, type RegisterFormValues, type OtpFormValues } from '../schemas';

const wizardSteps = ['Crear Cuenta', 'Registrar Escuela', 'Suscripción'];

const RegisterForm = () => {
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { register, resendConfirmationEmail, verifyEmailOtp, loginWithGoogle } = useAuth();

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      const result = await register(values.name, values.email, values.password);
      if (result.confirmationSent) {
        setConfirmationEmail(result.email);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrio un error.';
      setError(errorMessage);
      toast.error('Error al crear cuenta', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (values: OtpFormValues) => {
    if (!confirmationEmail) return;
    setError('');
    setIsVerifying(true);
    try {
      await verifyEmailOtp(confirmationEmail, values.token);
      toast.success('Email verificado correctamente');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Codigo invalido o expirado.';
      setError(errorMessage);
      toast.error('Error al verificar', { description: errorMessage });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!confirmationEmail) return;
    setIsResending(true);
    try {
      await resendConfirmationEmail(confirmationEmail);
      otpForm.reset();
      toast.success('Codigo reenviado correctamente');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reenviar el email.';
      toast.error('Error al reenviar', { description: errorMessage });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al iniciar sesión con Google.';
      setError(errorMessage);
      toast.error('Error al iniciar sesión', { description: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={1}>
      {confirmationEmail ? (
        <Card className="mx-auto w-full max-w-[540px] gap-4 py-4">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex flex-col gap-1.5 text-center">
              <h2 className="text-xl font-semibold text-foreground">Verifica tu email</h2>
              <p className="text-sm text-muted-foreground">
                Enviamos un codigo de verificacion a{' '}
                <span className="font-medium text-foreground">{confirmationEmail}</span>
              </p>
            </div>

            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                className="flex w-full flex-col items-center gap-3.5"
              >
                <FormField
                  control={otpForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isVerifying}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button type="submit" loading={isVerifying} className="w-full">
                  {isVerifying ? 'Verificando...' : 'Verificar Email'}
                </Button>
              </form>
            </Form>

            <div className="flex w-full flex-col items-center gap-2.5 pt-1">
              <p className="text-sm text-muted-foreground">
                No recibiste el codigo?{' '}
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="font-medium text-foreground hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Reenviando...' : 'Reenviar'}
                </button>
              </p>

              <Link
                to={ROUTE_PATHS.LOGIN}
                className="text-sm text-muted-foreground hover:underline"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto w-full max-w-[540px] gap-4 py-4">
          <CardContent className="flex flex-col gap-4 p-6 sm:p-7">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Crear Cuenta
              </h2>
              <p className="text-sm text-muted-foreground">Ingresa tus datos para comenzar</p>
            </div>

            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                <div className="flex flex-col gap-3.5">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Juan Perez"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección de Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            autoComplete="email"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
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
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
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

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.
                </p>

                {error && <p className="mt-1.5 text-center text-sm text-destructive">{error}</p>}

                <Button type="submit" loading={isLoading} className="mt-3 w-full">
                  {isLoading ? 'Creando...' : 'Crear Cuenta'}
                </Button>
              </form>
            </Form>

            <div className="flex items-center w-full gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full"
            >
              <span className="text-base font-bold text-foreground">G</span>
              Continuar con Google
            </Button>

            <div className="flex justify-center gap-1">
              <span className="text-sm text-muted-foreground">Ya tiene una cuenta?</span>
              <Link to={ROUTE_PATHS.LOGIN} className="text-sm font-medium text-foreground">
                Iniciar sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </AuthLayout>
  );
};

export default RegisterForm;
