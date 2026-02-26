import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const location = useLocation();

  const registrationSuccess = location.state?.registrationSuccess;

  const handleSubmit = async (e: FormEvent) => {
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
      const errorMessage = error instanceof Error ? error.message : 'Ocurrio un error.';
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
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesion con Google.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // ============================
  //  LOGIN MODE
  // ============================
  if (mode === 'login') {
    return (
      <AuthLayout variant="split">
        <div className="flex flex-col w-full gap-10">
          {/* Form header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-medium tracking-tight text-neutral-900">
              Iniciar sesion
            </h2>
            <p className="text-sm font-light text-neutral-500">
              Ingresa tus datos para continuar
            </p>
          </div>

          {/* Registration success banner */}
          {registrationSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4" role="alert">
              <p className="text-sm font-medium text-emerald-600">
                Registro exitoso. Ahora puede iniciar sesion.
              </p>
            </div>
          )}

          {/* Form fields */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-900">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 text-sm text-neutral-900 bg-transparent border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-neutral-900">Contrasena</label>
                  <span className="text-sm font-light text-neutral-500 cursor-pointer">
                    Olvidaste?
                  </span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="--------"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 text-sm text-neutral-900 bg-transparent border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center mt-3">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-6">
              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center bg-neutral-900 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 focus:outline-none hover:bg-neutral-800"
              >
                {isLoading ? 'Autenticando...' : 'Iniciar sesion'}
              </button>

              {/* Divider */}
              <div className="flex items-center w-full gap-4">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-sm font-light text-neutral-400">o</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center gap-2.5 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 focus:outline-none"
              >
                <span className="text-base font-bold text-neutral-500">G</span>
                <span className="text-sm font-medium text-neutral-900">
                  Continuar con Google
                </span>
              </button>
            </div>
          </form>

          {/* Register link */}
          <div className="flex justify-center gap-1.5">
            <span className="text-sm font-light text-neutral-500">
              No tenes cuenta?
            </span>
            <Link
              to={ROUTE_PATHS.REGISTER}
              className="text-sm font-medium text-neutral-900"
            >
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
  const wizardSteps = ['Crear Cuenta', 'Suscripcion', 'Empresa'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={1}>
      {showConfirmationMessage ? (
        <div className="bg-white border border-neutral-200 rounded-md w-full max-w-[440px] p-10">
          <div className="text-center flex flex-col gap-4">
            <h3 className="text-2xl font-medium text-neutral-900">
              Revise su correo electronico
            </h3>
            <p className="text-sm text-neutral-500">
              Enviamos un enlace de confirmacion a{' '}
              <span className="font-medium text-neutral-900">{email}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-md flex flex-col w-full max-w-[440px] p-10 gap-6">
          {/* Card header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-medium text-neutral-900">
              Crear Cuenta
            </h2>
            <p className="text-sm font-light text-neutral-500">
              Ingresa tus datos para comenzar
            </p>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-900">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Perez"
                  required
                  disabled={isLoading}
                  className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-900">
                  Direccion de Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-900">
                  Contrasena
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="--------"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="w-full h-11 px-3.5 text-sm text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Hint */}
            <p className="text-xs font-light text-neutral-500 mt-2">
              Minimo 8 caracteres, 1 mayuscula, 1 numero y 1 simbolo.
            </p>

            {error && (
              <p className="text-sm text-red-600 text-center mt-2">
                {error}
              </p>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center bg-neutral-900 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 focus:outline-none hover:bg-neutral-800 mt-4"
            >
              {isLoading ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center w-full gap-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs font-light text-neutral-400">o</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 flex items-center justify-center gap-2.5 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 focus:outline-none"
          >
            <span className="text-base font-bold text-neutral-900">G</span>
            <span className="text-sm font-medium text-neutral-900">
              Continuar con Google
            </span>
          </button>

          {/* Login link */}
          <div className="flex justify-center gap-1">
            <span className="text-sm font-light text-neutral-500">
              Ya tiene una cuenta?
            </span>
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="text-sm font-medium text-neutral-900"
            >
              Iniciar sesion
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default AuthPage;
