import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from './schemas';

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, resendConfirmationEmail, loginWithGoogle } = useAuth();
  const location = useLocation();

  const registrationSuccess = location.state?.registrationSuccess;
  const emailConfirmed = new URLSearchParams(location.search).get('confirmed') === 'true';

  // ─── Login form ─────────────────────────────────────────
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // ─── Register form ──────────────────────────────────────
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      await login(values.email, values.password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error.';
      setError(errorMessage);
      toast.error('Error al iniciar sesión', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      const result = await register(values.name, values.email, values.password);
      if (result.confirmationSent) {
        setConfirmationEmail(result.email);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error.';
      setError(errorMessage);
      toast.error('Error al crear cuenta', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!confirmationEmail) return;
    setIsResending(true);
    try {
      await resendConfirmationEmail(confirmationEmail);
      toast.success('Email reenviado correctamente');
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

  // ============================
  //  LOGIN MODE
  // ============================
  if (mode === 'login') {
    return (
      <AuthLayout variant="split">
        <div className="flex flex-col w-full gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Iniciar sesión
            </h2>
            <p className="text-sm text-muted-foreground">Ingresá tus datos para continuar</p>
          </div>

          {(registrationSuccess || emailConfirmed) && (
            <div className="bg-emerald-50 rounded-md border border-emerald-200 p-4" role="alert">
              <p className="text-sm font-medium text-emerald-600">
                {emailConfirmed
                  ? 'Email confirmado exitosamente. Iniciá sesión para continuar con el registro de tu institución.'
                  : 'Registro exitoso. Ahora podés iniciar sesión.'}
              </p>
            </div>
          )}

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Contraseña</FormLabel>
                        <span className="text-sm text-muted-foreground cursor-pointer">
                          ¿Olvidaste?
                        </span>
                      </div>
                      <FormControl>
                        <PasswordInput
                          placeholder="--------"
                          autoComplete="current-password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && <p className="text-sm text-destructive text-center mt-3">{error}</p>}

              <div className="flex flex-col gap-4 mt-6">
                <Button type="submit" loading={isLoading} className="w-full">
                  {isLoading ? 'Autenticando...' : 'Iniciar sesión'}
                </Button>

                <div className="flex items-center w-full gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">o</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  <span className="text-base font-bold text-muted-foreground">G</span>
                  Continuar con Google
                </Button>
              </div>
            </form>
          </Form>

          <div className="flex justify-center gap-1.5">
            <span className="text-sm text-muted-foreground">¿No tenés cuenta?</span>
            <Link to={ROUTE_PATHS.REGISTER} className="text-sm font-medium text-foreground">
              Registrate
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ============================
  //  REGISTER MODE
  // ============================
  const wizardSteps = ['Crear Cuenta', 'Registrar Escuela', 'Suscripción'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={1}>
      {confirmationEmail ? (
        <Card className="w-full max-w-[440px]">
          <CardContent className="p-8 flex flex-col items-center gap-5">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex flex-col gap-1.5 text-center">
              <h2 className="text-xl font-semibold text-foreground">Revisá tu email</h2>
              <p className="text-sm text-muted-foreground">
                Enviamos un enlace de confirmación a{' '}
                <span className="font-medium text-foreground">{confirmationEmail}</span>
              </p>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Hacé clic en el enlace del email para confirmar tu cuenta y continuar con el registro.
            </p>

            <div className="flex flex-col items-center gap-3 w-full pt-2">
              <p className="text-sm text-muted-foreground">
                ¿No recibiste el email?{' '}
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
        <Card className="w-full max-w-[440px]">
          <CardContent className="p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Crear Cuenta
              </h2>
              <p className="text-sm text-muted-foreground">Ingresá tus datos para comenzar</p>
            </div>

            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Juan Pérez"
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

                <p className="text-xs text-muted-foreground mt-2">
                  Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
                </p>

                {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}

                <Button type="submit" loading={isLoading} className="w-full mt-4">
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
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full"
            >
              <span className="text-base font-bold text-foreground">G</span>
              Continuar con Google
            </Button>

            <div className="flex justify-center gap-1">
              <span className="text-sm text-muted-foreground">¿Ya tiene una cuenta?</span>
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

export default AuthPage;
