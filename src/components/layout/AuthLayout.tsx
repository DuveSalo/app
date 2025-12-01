
import React from 'react';
import { Link } from 'react-router-dom';
import { AppLogoIcon, CheckIcon } from '../common/Icons';

// --- Local Sub-components to avoid creating new files ---

const DecorativePanel: React.FC = () => (
  <div className="relative h-full w-full bg-gradient-to-b from-blue-700 to-blue-900 overflow-hidden">
    {/* Subtle geometric pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-full h-full" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
    </div>

    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-12 text-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-8">
        <AppLogoIcon className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold leading-tight mb-4">
        Plataforma de Cumplimiento Integral
      </h1>
      <p className="text-base text-blue-100 max-w-md mb-8">
        Gestione la seguridad, la documentación y los informes de incidentes, todo en un solo lugar.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-blue-100">Certificaciones</span>
        <span className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-blue-100">Auditorías</span>
        <span className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-blue-100">Documentos</span>
      </div>
    </div>
  </div>
);

const WizardStepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0" />
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let stepClasses = 'bg-gray-200 text-gray-500 border-2 border-gray-200';
          if (isActive) {
            stepClasses = 'bg-primary text-white border-2 border-primary';
          } else if (isCompleted) {
            stepClasses = 'bg-semantic-success text-white border-2 border-semantic-success';
          }

          return (
            <div key={label} className="flex flex-col items-center z-10 bg-gray-50 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${stepClasses}`}>
                {isCompleted ? <CheckIcon className="w-5 h-5" /> : stepNumber}
              </div>
              <span className={`mt-1 text-xs font-semibold text-center ${isActive ? 'text-primary' : 'text-gray-500'}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


interface AuthLayoutProps {
    children: React.ReactNode;
    variant: 'split' | 'wizard';
    title?: string;
    subtitle?: string;
    wizardSteps?: string[];
    currentStep?: number;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, variant, title, subtitle, wizardSteps = [], currentStep = 1 }) => {
    
    // --- Split Layout Variant (for Login) ---
    if (variant === 'split') {
        return (
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
                <div className="hidden lg:flex items-center justify-center">
                    <DecorativePanel />
                </div>
                <div className="w-full flex items-center justify-center p-8 sm:p-12 bg-gray-50">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                            <p className="text-gray-500 mt-2">{subtitle}</p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        );
    }
    
    // --- Wizard Layout Variant (for Onboarding) ---
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="mb-4 flex items-center gap-2 text-gray-800">
                <AppLogoIcon className="w-7 h-7 text-primary" />
                <span className="text-xl font-bold">Escuela Segura</span>
            </Link>
            <WizardStepper steps={wizardSteps} currentStep={currentStep} />
            <main className="w-full flex-1 flex items-start justify-center overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;
