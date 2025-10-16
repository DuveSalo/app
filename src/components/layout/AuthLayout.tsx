
import React from 'react';
import { Link } from 'react-router-dom';
import { AppLogoIcon, CheckIcon } from '../common/Icons';

// --- Local Sub-components to avoid creating new files ---

const DecorativePanel: React.FC = () => (
  <div className="relative h-full w-full bg-gradient-to-br from-primary via-primary-dark to-navy-dark overflow-hidden">
    <div className="absolute -top-10 -left-16 w-64 h-64 bg-blue-accent/10 rounded-full animate-float" />
    <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-blue-accent/10 rounded-full animation-delay-2000 animate-float" />
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-12 text-center">
      <AppLogoIcon className="w-16 h-16 text-white mb-6" />
      <h1 className="text-4xl font-bold leading-tight mb-4">
        Plataforma de Cumplimiento Integral
      </h1>
      <p className="text-lg text-blue-200/80 max-w-md">
        Gestione la seguridad, la documentación y los informes de incidentes, todo en un solo lugar.
      </p>
    </div>
  </div>
);

const WizardStepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${stepClasses}`}>
                {isCompleted ? <CheckIcon className="w-6 h-6" /> : stepNumber}
              </div>
              <span className={`mt-2 text-xs font-semibold text-center ${isActive ? 'text-primary' : 'text-gray-500'}`}>{label}</span>
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="mb-6 flex items-center gap-2 text-gray-800">
                <AppLogoIcon className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold">SafetyGuard Pro</span>
            </Link>
            <WizardStepper steps={wizardSteps} currentStep={currentStep} />
            <main className="w-full">
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;
