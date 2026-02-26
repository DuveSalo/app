import { type Dispatch, type SetStateAction, type FormEvent } from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import type { User } from '../../../types/index';

interface ProfileSectionProps {
  currentUser: User;
  isEditing: boolean;
  profileForm: { name: string; email: string };
  setProfileForm: Dispatch<SetStateAction<{ name: string; email: string }>>;
  handleProfileSubmit: (e: FormEvent) => void;
  handlePasswordReset: () => void;
  isPasswordResetLoading: boolean;
  error: string;
}

export const ProfileSection = ({
  currentUser,
  isEditing,
  profileForm,
  setProfileForm,
  handleProfileSubmit,
  handlePasswordReset,
  isPasswordResetLoading,
  error,
}: ProfileSectionProps) => {
  if (isEditing) {
    return (
      <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-6">
        <div>
          <h2 className="text-base font-medium text-neutral-900">Mi Perfil</h2>
          <Input id="profileName" label="Nombre completo" value={profileForm.name} onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))} required className="mt-4" />
          <Input id="profileEmail" label="Email" value={profileForm.email} disabled className="mt-4"/>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-sm font-medium text-neutral-900">Seguridad de la Cuenta</h3>
          <p className="text-sm text-neutral-500 mt-1">Para cambiar su contrasena, le enviaremos un enlace seguro a su correo electronico.</p>
          <Button type="button" variant="outline" onClick={handlePasswordReset} loading={isPasswordResetLoading} className="mt-4">
            Enviar enlace para restablecer contrasena
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-medium text-neutral-900">Mi Perfil</h2>
      <Card>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-neutral-900 mb-1">Nombre completo</p>
            <p className="text-sm text-neutral-900">{currentUser.name}</p>
          </div>
          <div className="border-t border-neutral-200 pt-3">
            <p className="text-sm font-medium text-neutral-900 mb-1">Email</p>
            <p className="text-sm text-neutral-900">{currentUser.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-900">Seguridad de la Cuenta</h3>
          <p className="text-sm text-neutral-500">Para cambiar su contrasena, le enviaremos un enlace seguro a su correo electronico.</p>
          <Button type="button" variant="outline" onClick={handlePasswordReset} loading={isPasswordResetLoading} className="mt-2">
            Enviar enlace para restablecer contrasena
          </Button>
        </div>
      </Card>
    </div>
  );
};
