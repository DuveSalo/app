
import React from 'react';
import { Link } from 'react-router-dom';
import { AppLogoIcon, CheckIcon } from '../common/Icons';

// --- Local Sub-components to avoid creating new files ---

const DecorativePanel: React.FC = () => (
  <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
    {/* Abstract geometric pattern */}
    <div className="absolute inset-0">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-700/30 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-slate-700/20 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
    </div>

    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-12 text-center">
      <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 ring-1 ring-white/20">
        <span className="text-2xl font-bold">ES</span>
      </div>
      <h1 className="text-3xl font-bold leading-tight mb-3">
        Escuela Segura
      </h1>
      <p className="text-base text-slate-300 max-w-sm mb-10 leading-relaxed">
        Plataforma integral para la gestión de seguridad, documentación y cumplimiento normativo.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="px-3.5 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg text-sm text-slate-300 ring-1 ring-white/10">Certificaciones</span>
        <span className="px-3.5 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg text-sm text-slate-300 ring-1 ring-white/10">Auditorías</span>
        <span className="px-3.5 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg text-sm text-slate-300 ring-1 ring-white/10">Documentos</span>
      </div>
    </div>
  </div>
);

const WizardStepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 -z-0" />
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let stepClasses = 'bg-white text-slate-400 border-2 border-slate-200';
          if (isActive) {
            stepClasses = 'bg-slate-900 text-white border-2 border-slate-900';
          } else if (isCompleted) {
            stepClasses = 'bg-emerald-500 text-white border-2 border-emerald-500';
          }

          return (
            <div key={label} className="flex flex-col items-center z-10 bg-slate-50 px-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 ${stepClasses}`}>
                {isCompleted ? <CheckIcon className="w-4 h-4" /> : stepNumber}
              </div>
              <span className={`mt-2 text-xs font-medium text-center ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
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
                <div className="w-full flex items-center justify-center p-8 sm:p-12 bg-slate-50">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                            <p className="text-slate-500 mt-2 text-sm">{subtitle}</p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // --- Wizard Layout Variant (for Onboarding) ---
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="mb-6 flex items-center gap-2.5 text-slate-900">
                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ES</span>
                </div>
                <span className="text-lg font-semibold">Escuela Segura</span>
            </Link>
            <WizardStepper steps={wizardSteps} currentStep={currentStep} />
            <main className="w-full flex-1 flex items-start justify-center overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;
