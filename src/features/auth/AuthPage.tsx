


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
  const { login, register } = useAuth();
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
      if (errorMessage.includes('EMAIL_CONFIRMATION_REQUIRED')) {
        setShowConfirmationMessage(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const isLogin = mode === 'login';

  // LOGIN MODE: Renders the classic split-screen layout.
  if (isLogin) {
    const pageTitle = 'Bienvenido a SafetyGuard Pro';
    const pageSubtitle = 'Ingrese sus credenciales para acceder a la plataforma.';
    
    return (
      <AuthLayout title={pageTitle} subtitle={pageSubtitle} variant="split">
        {registrationSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 flex items-start" role="alert">
            <CheckIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">¡Registro Exitoso!</p>
              <p className="text-sm">Ahora puede iniciar sesión con sus nuevas credenciales.</p>
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
            <a href="#" className="text-sm text-blue-600 hover:underline">¿Olvidó su contraseña?</a>
          </div>
          {error && !error.includes("credenciales") && <p className="text-sm text-red-600 text-center py-2">{error}</p>}
          <div className="pt-2">
            <Button type="submit" loading={isLoading} size="lg" className="w-full">
              {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tiene una cuenta?{' '}
          <Link to={ROUTE_PATHS.REGISTER} className="font-medium text-blue-600 hover:underline">
            Regístrese.
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
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Cree su Cuenta</h2>
                <p className="text-gray-500 mt-0.5 text-xs">Comience gratis y centralice la gestión de su empresa.</p>
            </div>

            {showConfirmationMessage ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-3 rounded-md mb-3" role="alert">
                <div className="flex items-start">
                  <CheckIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-bold text-base mb-1">¡Registro Exitoso!</p>
                    <p className="text-xs mb-2">
                      Se ha enviado un email de confirmación a <strong>{email}</strong>
                    </p>
                    <p className="text-xs mb-1">
                      Para continuar con la configuración de su empresa:
                    </p>
                    <ol className="list-decimal list-inside text-xs space-y-0.5 ml-2">
                      <li>Revise su bandeja de entrada (o carpeta de spam)</li>
                      <li>Haga clic en el enlace de confirmación en el email</li>
                      <li>Será redirigido automáticamente para crear su empresa</li>
                    </ol>
                    <div className="mt-2 p-2 bg-blue-100 rounded-md">
                      <p className="text-xs font-medium">
                        💡 <strong>Importante:</strong> No necesita iniciar sesión después de confirmar. Será redirigido automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
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
                    <div className="pt-1">
                        <Button type="submit" loading={isLoading} size="lg" className="w-full" disabled={isLoading}>
                            Crear Cuenta
                        </Button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    ¿Ya tiene una cuenta?{' '}
                    <Link to={ROUTE_PATHS.LOGIN} className="font-medium text-blue-600 hover:underline">
                        Inicie sesión.
                    </Link>
                </p>
                <p className="text-gray-500 text-xs font-normal text-center mt-2 max-w-xs mx-auto">
                    Al registrarse, usted acepta nuestros <a href="#" className="underline hover:text-blue-600">Términos de Servicio</a> y nuestra <a href="#" className="underline hover:text-blue-600">Política de Privacidad</a>.
                </p>
              </>
            )}
        </div>
    </AuthLayout>
  );
};

export default AuthPage;