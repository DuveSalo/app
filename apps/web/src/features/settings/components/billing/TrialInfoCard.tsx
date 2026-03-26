interface TrialInfoCardProps {
  trialEndsAt: string;
}

export const TrialInfoCard = ({ trialEndsAt }: TrialInfoCardProps) => (
  <div className="pb-5">
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-sm font-medium text-info">Periodo de prueba</h3>
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-info/10 text-info">
        Activo
      </span>
    </div>
    <p className="text-sm text-info">
      Tu prueba gratuita finaliza el{' '}
      <span className="font-medium">
        {new Date(trialEndsAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </span>
      . Suscribite a un plan antes de esa fecha para mantener el acceso.
    </p>
  </div>
);
