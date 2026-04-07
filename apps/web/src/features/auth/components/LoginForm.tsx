import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import * as api from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { loginSchema, type LoginFormValues } from '../schemas';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const location = useLocation();

  const registrationSuccess = location.state?.registrationSuccess;
  const emailConfirmed = new URLSearchParams(location.search).get('confirmed') === 'true';

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      await login(values.email, values.password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrio un error.';
      setError(errorMessage);
      toast.error('Error al iniciar sesion', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await api.sendPasswordResetEmail(forgotEmail);
      setForgotSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar el enlace.';
      toast.error('Error', { description: msg });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al iniciar sesion con Google.';
      setError(errorMessage);
      toast.error('Error al iniciar sesion', { description: errorMessage });
      setIsLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <AuthLayout variant="split">
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Restablecer contrasena
            </h2>
            <p className="text-sm text-muted-foreground">
              Ingresa tu email y te enviaremos un enlace para crear una nueva contrasena.
            </p>
          </div>

          {forgotSent ? (
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1.5 text-center">
                <h3 className="text-base font-semibold text-foreground">Revisa tu email</h3>
                <p className="text-sm text-muted-foreground">
                  Si existe una cuenta con{' '}
                  <span className="font-medium text-foreground">{forgotEmail}</span>, recibiras un
                  enlace para restablecer tu contrasena.
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setForgotMode(false);
                  setForgotSent(false);
                  setForgotEmail('');
                }}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesion
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={forgotLoading}
                  />
                </div>
                <Button
                  onClick={handleForgotPassword}
                  loading={forgotLoading}
                  disabled={!forgotEmail}
                  className="w-full"
                >
                  Enviar enlace
                </Button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setForgotEmail('');
                }}
                className="text-center text-sm text-muted-foreground hover:underline"
              >
                <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
                Volver al inicio de sesion
              </button>
            </>
          )}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="split">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Iniciar sesion</h2>
          <p className="text-sm text-muted-foreground">Ingresa tus datos para continuar</p>
        </div>

        {(registrationSuccess || emailConfirmed) && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4" role="alert">
            <p className="text-sm font-medium text-emerald-600">
              {emailConfirmed
                ? 'Email confirmado exitosamente. Inicia sesion para continuar con el registro de tu institucion.'
                : 'Registro exitoso. Ahora podes iniciar sesion.'}
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
                      <FormLabel>Contrasena</FormLabel>
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        Olvidaste?
                      </button>
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

            {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}

            <div className="mt-6 flex flex-col gap-4">
              <Button type="submit" loading={isLoading} className="w-full">
                {isLoading ? 'Autenticando...' : 'Iniciar sesion'}
              </Button>

              <div className="flex items-center w-full gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">o</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                type="button"
                variant="ghost"
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
          <span className="text-sm text-muted-foreground">No tenes cuenta?</span>
          <Link to={ROUTE_PATHS.REGISTER} className="text-sm font-medium text-foreground">
            Registrate
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
