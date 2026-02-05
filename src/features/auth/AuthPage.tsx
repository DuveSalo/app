


import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { Checkbox } from '../../components/common/Checkbox';
import { CheckIcon } from '../../components/common/Icons';

const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const location = useLocation();

  const registrationSuccess = location.state?.registrationSuccess;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowConfirmationMessage(false);
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error.';
      // Check for email confirmation requirement - check both message content and error code
      const isEmailConfirmation =
        errorMessage.includes('EMAIL_CONFIRMATION_REQUIRED') ||
        errorMessage.includes('confirma tu email') ||
        errorMessage.includes('email confirmation') ||
        (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'EMAIL_CONFIRMATION_REQUIRED');

      if (isEmailConfirmation) {
        setShowConfirmationMessage(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión con Google.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };
  
  const isLogin = mode === 'login';

  // LOGIN MODE: Renders the classic split-screen layout.
  if (isLogin) {
    const pageTitle = 'Bienvenido a Escuela Segura';
    const pageSubtitle = 'Ingrese sus credenciales para acceder a la plataforma.';

    return (
      <AuthLayout title={pageTitle} subtitle={pageSubtitle} variant="split">
        {registrationSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 flex items-start" role="alert">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3 flex-shrink-0">
              <CheckIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Registro Exitoso</p>
              <p className="text-sm text-emerald-700 mt-0.5">Ahora puede iniciar sesión con sus nuevas credenciales.</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Dirección de Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@empresa.com"
            autoComplete="email"
            required
            disabled={isLoading}
            error={error && error.includes("credenciales") ? "Email o contraseña incorrectos." : ""}
          />
          <Input
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <Checkbox label="Recordarme" id="remember" disabled={isLoading}/>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">¿Olvidó su contraseña?</a>
          </div>
          {error && !error.includes("credenciales") && <p className="text-sm text-red-600 text-center py-2">{error}</p>}
          <div className="pt-2">
            <Button type="submit" loading={isLoading} size="lg" className="w-full">
              {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">O continuar con</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </Button>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tiene una cuenta?{' '}
          <Link to={ROUTE_PATHS.REGISTER} className="font-medium text-gray-900 hover:underline">
            Regístrese
          </Link>
        </p>
      </AuthLayout>
    );
  }

  // REGISTER MODE: Renders the first step of the onboarding wizard.
  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripción'];
  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={1}>
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Cree su Cuenta</h2>
                <p className="text-gray-500 mt-1 text-sm">Comience gratis y centralice la gestión de su empresa.</p>
            </div>

            {showConfirmationMessage ? (
              <div className="text-center py-6" role="status">
                {/* Email Icon */}
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Revise su correo electrónico
                </h3>

                {/* Email address */}
                <p className="text-sm text-gray-600 mb-6">
                  Enviamos un enlace de confirmación a<br />
                  <span className="font-medium text-gray-900">{email}</span>
                </p>

                {/* Instructions card */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">Siguientes pasos:</p>
                  <ol className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-gray-200 text-gray-600 rounded-full text-xs flex items-center justify-center font-medium">1</span>
                      <span>Abra su bandeja de entrada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-gray-200 text-gray-600 rounded-full text-xs flex items-center justify-center font-medium">2</span>
                      <span>Haga clic en el enlace de confirmación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-gray-200 text-gray-600 rounded-full text-xs flex items-center justify-center font-medium">3</span>
                      <span>Será redirigido automáticamente</span>
                    </li>
                  </ol>
                </div>

                {/* Spam note */}
                <p className="text-xs text-gray-500">
                  ¿No lo encuentra? Revise su carpeta de spam.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                        label="Nombre Completo"
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        disabled={isLoading}
                    />
                    <Input
                        label="Dirección de Email"
                        id="email-register"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@empresa.com"
                        autoComplete="email"
                        required
                        disabled={isLoading}
                    />
                    <Input
                        label="Contraseña"
                        id="password-register"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números.
                    </p>
                    {error && <p className="text-sm text-red-600 text-center py-1">{error}</p>}
                    <div className="pt-2">
                        <Button type="submit" loading={isLoading} size="lg" className="w-full" disabled={isLoading}>
                            Crear Cuenta
                        </Button>
                    </div>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">O continuar con</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>

                <p className="mt-5 text-center text-sm text-gray-600">
                    ¿Ya tiene una cuenta?{' '}
                    <Link to={ROUTE_PATHS.LOGIN} className="font-medium text-gray-900 hover:underline">
                        Inicie sesión
                    </Link>
                </p>
                <p className="text-gray-400 text-xs font-normal text-center mt-3 max-w-xs mx-auto leading-relaxed">
                    Al registrarse, usted acepta nuestros <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Términos de Servicio</a> y nuestra <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Política de Privacidad</a>.
                </p>
              </>
            )}
        </div>
    </AuthLayout>
  );
};

export default AuthPage;