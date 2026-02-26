import { type ReactNode } from 'react';

const OnboardingStepper = ({ steps, currentStep }: { steps: string[]; currentStep: number }) => {
  return (
    <div className="flex items-center gap-8">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isCompleted = isDone || isActive;

        return (
          <div key={label} className="contents">
            {index > 0 && (
              <div className={`w-10 h-px ${isDone ? 'bg-brand-700' : 'bg-neutral-200'}`} />
            )}
            <div className="flex items-center gap-2.5">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-brand-700 text-white'
                    : 'border border-neutral-300 text-neutral-400'
                }`}
              >
                {stepNumber}
              </div>
              <span
                className={`text-sm ${
                  isCompleted ? 'font-medium text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface AuthLayoutProps {
  children: ReactNode;
  variant: 'split' | 'wizard';
  title?: string;
  subtitle?: string;
  wizardSteps?: string[];
  currentStep?: number;
}

const AuthLayout = ({
  children,
  variant,
  wizardSteps = [],
  currentStep = 1,
}: AuthLayoutProps) => {
  if (variant === 'split') {
    return (
      <div className="h-screen flex bg-white">
        {/* Left: Hero */}
        <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-12 bg-gradient-to-br from-brand-50 via-white to-neutral-50">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-brand-700 rounded-lg w-8 h-8" />
            <span className="text-base font-bold text-neutral-900 font-[family-name:var(--font-heading)]">
              Escuela Segura
            </span>
          </div>

          {/* Middle: Hero text */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-neutral-900 max-w-[500px] font-[family-name:var(--font-heading)]">
              Gestión de seguridad escolar, simplificada.
            </h1>
            <p className="text-base font-normal leading-relaxed text-neutral-500 max-w-[420px]">
              Controla vencimientos, certificados y normativas en un solo lugar. Sin complicaciones.
            </p>
          </div>

          {/* Bottom: Stats */}
          <div className="flex items-center gap-12">
            {[
              { value: '2,400+', label: 'Documentos gestionados' },
              { value: '99.8%', label: 'Uptime' },
              { value: '150+', label: 'Escuelas activas' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-brand-800 font-[family-name:var(--font-heading)]">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex flex-col justify-center border-l border-neutral-200 w-full lg:w-[480px] lg:flex-shrink-0 px-12 sm:px-16">
          {/* Mobile logo */}
          <div className="flex items-center justify-center mb-10 lg:hidden gap-3">
            <div className="bg-brand-700 rounded-lg w-8 h-8" />
            <span className="text-base font-bold text-neutral-900 font-[family-name:var(--font-heading)]">
              Escuela Segura
            </span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // --- Wizard Layout (Onboarding) ---
  return (
    <div className="min-h-screen flex flex-col items-center overflow-y-auto custom-scrollbar bg-gradient-to-b from-brand-50/50 to-neutral-50">
      {/* Top bar */}
      <div className="w-full flex items-center flex-shrink-0 h-16 px-8">
        <span className="text-base font-bold text-neutral-900 font-[family-name:var(--font-heading)]">
          Escuela Segura
        </span>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full gap-8 px-4 pb-10">
        {wizardSteps.length > 0 && (
          <OnboardingStepper steps={wizardSteps} currentStep={currentStep} />
        )}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
