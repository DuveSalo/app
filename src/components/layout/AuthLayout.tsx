
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from '../common/Icons';

// --- Local Sub-components to avoid creating new files ---

const DecorativePanel: React.FC = () => (
  <div className="relative h-full w-full bg-gray-950 overflow-hidden">
    {/* Grid pattern */}
    <div className="absolute inset-0" style={{
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
      backgroundSize: '32px 32px',
    }} />

    {/* Gradient orbs */}
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gray-800/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gray-700/30 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
    </div>

    {/* Geometric lines */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
      <div className="absolute top-1/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute top-2/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>

    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-12 text-center">
      <div className="h-14 w-14 rounded-2xl bg-white/[0.08] backdrop-blur-sm flex items-center justify-center mb-8 ring-1 ring-white/[0.12]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="text-3xl font-semibold leading-tight mb-3 tracking-tight">
        Escuela Segura
      </h1>
      <p className="text-sm text-gray-400 max-w-xs mb-12 leading-relaxed">
        Plataforma integral para la gestión de seguridad, documentación y cumplimiento normativo.
      </p>

      {/* Feature cards */}
      <div className="space-y-3 w-full max-w-xs">
        {[
          { label: 'Certificaciones', desc: 'Control de vencimientos automatizado' },
          { label: 'Auditorías', desc: 'Registro completo de inspecciones' },
          { label: 'Archivos', desc: 'Acceso inmediato a documentación' },
        ].map((feature) => (
          <div key={feature.label} className="flex items-start gap-3 text-left p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">{feature.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const WizardStepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="relative flex items-center justify-between">
        {/* Progress line */}
        <div className="absolute top-4 left-[16%] right-[16%] h-px bg-gray-200 -z-0" />
        <div
          className="absolute top-4 left-[16%] h-px bg-gray-900 -z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 68}%` }}
        />
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let stepClasses = 'bg-white text-gray-400 border-2 border-gray-200';
          if (isActive) {
            stepClasses = 'bg-gray-900 text-white border-2 border-gray-900 shadow-sm';
          } else if (isCompleted) {
            stepClasses = 'bg-gray-900 text-white border-2 border-gray-900';
          }

          return (
            <div key={label} className="flex flex-col items-center z-10 bg-gray-50 px-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${stepClasses}`}>
                {isCompleted ? <CheckIcon className="w-4 h-4" /> : stepNumber}
              </div>
              <span className={`mt-2.5 text-xs font-medium text-center transition-colors ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
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
                <div className="w-full flex items-center justify-center p-8 sm:p-12 bg-white">
                    <div className="w-full max-w-sm">
                        {/* Mobile logo */}
                        <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
                            <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span className="text-lg font-semibold tracking-tight text-gray-900">Escuela Segura</span>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h2>
                            <p className="text-gray-500 mt-2 text-sm">{subtitle}</p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // --- Wizard Layout Variant (for Onboarding) ---
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="mb-8 flex items-center gap-2.5 text-gray-900">
                <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <span className="text-base font-semibold tracking-tight">Escuela Segura</span>
            </Link>
            <WizardStepper steps={wizardSteps} currentStep={currentStep} />
            <main className="w-full flex-1 flex items-start justify-center overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;
