import { type ReactNode } from 'react';

const BrandMark = ({
  nameClassName = 'text-base font-semibold text-foreground',
}: {
  nameClassName?: string;
}) => (
  <>
    <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
      ES
    </div>
    <span className={nameClassName}>Escuela Segura</span>
  </>
);

const HERO_STATS = [
  { value: '2,400+', label: 'Documentos gestionados' },
  { value: '99.8%', label: 'Uptime' },
  { value: '150+', label: 'Escuelas activas' },
] as const;

const OnboardingStepper = ({ steps, currentStep }: { steps: string[]; currentStep: number }) => (
  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
    {steps.map((label, index) => {
      const stepNumber = index + 1;
      const isDone = stepNumber < currentStep;
      const isActive = stepNumber === currentStep;
      const isCompleted = isDone || isActive;

      return (
        <div key={label} className="contents">
          {index > 0 && (
            <div
              className={`hidden h-px w-8 sm:block ${index < currentStep ? 'bg-primary' : 'bg-border'}`}
            />
          )}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 ${
                isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground'
              }`}
            >
              {stepNumber}
            </div>
            <span
              className={
                isCompleted
                  ? 'text-sm font-medium text-foreground'
                  : 'text-sm text-muted-foreground'
              }
            >
              {label}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

interface AuthLayoutProps {
  children: ReactNode;
  variant: 'split' | 'wizard';
  wizardSteps?: string[];
  currentStep?: number;
}

const AuthLayout = ({ children, variant, wizardSteps = [], currentStep = 1 }: AuthLayoutProps) => {
  if (variant === 'split') {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden flex-1 flex-col justify-between bg-background px-20 py-16 lg:flex">
          <div className="flex items-center gap-3">
            <BrandMark nameClassName="text-base font-bold text-foreground" />
          </div>

          <div className="flex max-w-[560px] flex-col gap-6">
            <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-foreground">
              Gestion de seguridad escolar, simplificada.
            </h1>
            <p className="max-w-[440px] text-base leading-relaxed text-muted-foreground">
              Controla vencimientos, certificados y normativas en un solo lugar. Sin complicaciones.
            </p>
          </div>

          <div className="flex items-center gap-12">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 text-center">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col justify-center px-12 py-10 sm:px-20 lg:w-[480px] lg:flex-shrink-0 lg:border-l lg:border-border lg:py-0">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <BrandMark />
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto bg-muted">
      <div className="flex min-h-full flex-col">
        <div className="flex h-12 w-full flex-shrink-0 items-center gap-3 px-6 sm:px-10">
          <BrandMark />
        </div>

        <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center gap-2 px-4 pb-6 pt-1 sm:gap-3 sm:px-6 sm:pb-6 sm:pt-2">
          {wizardSteps.length > 0 && (
            <OnboardingStepper steps={wizardSteps} currentStep={currentStep} />
          )}
          <div className="flex w-full flex-col items-center">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
