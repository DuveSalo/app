import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import * as api from '@/lib/api/services';
import type { User } from '@/types/index';

interface ProfileSectionProps {
  currentUser: User;
}

export const ProfileSection = ({ currentUser }: ProfileSectionProps) => {
  const { updateUserDetails, logout } = useAuth();
  // Personal info state
  const [name, setName] = useState(currentUser.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleSaveName = async () => {
    setIsSavingName(true);
    try {
      await updateUserDetails({ name });
      toast.success('Perfil actualizado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      toast.error(message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setIsSendingReset(true);
    try {
      await api.sendPasswordResetEmail(currentUser.email);
      toast.success('Revisá tu email para restablecer tu contraseña.');
      setResetDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar el email';
      toast.error(message);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      toast.success('Cuenta eliminada');
      await logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la cuenta';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-0">
      {/* Section 1: Personal info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <div className="flex gap-3">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-sm"
            />
            {name !== currentUser.name && (
              <Button onClick={handleSaveName} loading={isSavingName}>
                Guardar
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={currentUser.email} disabled className="max-w-sm" />
          <p className="text-xs text-muted-foreground">
            Para cambiar tu email, contactá a soporte.
          </p>
        </div>
      </div>

      {/* Section 3: Security */}
      <div className="border-t border-border pt-6 mt-6 space-y-3">
        <h3 className="text-base font-medium">Seguridad de la cuenta</h3>
        <p className="text-sm text-muted-foreground">
          Podés cambiar tu contraseña a través de un enlace enviado a tu email.
        </p>
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button>Cambiar contraseña</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cambiar contraseña?</AlertDialogTitle>
              <AlertDialogDescription>
                Te enviaremos un email a <span className="font-medium">{currentUser.email}</span>{' '}
                con un enlace para establecer tu nueva contraseña.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSendingReset}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendPasswordReset} disabled={isSendingReset}>
                {isSendingReset ? 'Enviando...' : 'Enviar email'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Section 4: Danger zone */}
      <div className="border-t border-border pt-6 mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-base font-medium text-destructive">Eliminar cuenta</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Al eliminar tu cuenta se borrarán todos tus datos permanentemente. Esta acción no se puede
          deshacer.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Eliminar cuenta</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminarán todos tus datos, documentos y configuración. Esta acción es permanente
                e irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDeleteAccount}>
                Sí, eliminar mi cuenta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
