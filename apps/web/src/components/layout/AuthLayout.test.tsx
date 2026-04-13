import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AuthLayout from './AuthLayout';

describe('AuthLayout', () => {
  it('renders the split hero, both brand lockups, and the child content', () => {
    render(
      <AuthLayout variant="split">
        <div>Contenido auth</div>
      </AuthLayout>
    );

    expect(screen.getByText('Gestion de seguridad escolar, simplificada.')).toBeInTheDocument();
    expect(screen.getByText('Documentos gestionados')).toBeInTheDocument();
    expect(screen.getAllByText('Escuela Segura')).toHaveLength(2);
    expect(screen.getByText('Contenido auth')).toBeInTheDocument();
  });

  it('renders the wizard header, stepper, and active step', () => {
    render(
      <AuthLayout
        variant="wizard"
        wizardSteps={['Crear Cuenta', 'Registrar Escuela', 'Suscripción']}
        currentStep={2}
      >
        <div>Paso actual</div>
      </AuthLayout>
    );

    expect(screen.getByText('Escuela Segura')).toBeInTheDocument();
    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument();
    expect(screen.getByText('Registrar Escuela')).toBeInTheDocument();
    expect(screen.getByText('Suscripción')).toBeInTheDocument();
    expect(screen.getByText('2')).toHaveClass('bg-primary');
    expect(screen.getByText('Paso actual')).toBeInTheDocument();
  });
});
