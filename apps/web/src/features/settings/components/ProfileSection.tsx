import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
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
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas';

interface ProfileSectionProps {
  currentUser: User;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ProfileSection = ({ currentUser }: ProfileSectionProps) => {
  const { updateUserDetails } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal info state (kept as-is, not part of the form migration)
  const [name, setName] = useState(currentUser.name);
  const [isSavingName, setIsSavingName] = useState(false);

  // Password form
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleAvatarUpload = () => {
    // TODO: Upload to Supabase Storage bucket "avatars" and update user profile
    toast.info('Función disponible próximamente');
  };

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

  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      // Verify current password
      const isValid = await api.verifyCurrentPassword(currentUser.email, values.currentPassword);
      if (!isValid) {
        passwordForm.setError('currentPassword', { message: 'Contraseña actual incorrecta' });
        setIsChangingPassword(false);
        return;
      }

      // Update password
      await api.changePassword(values.newPassword);
      toast.success('Contraseña actualizada');
      passwordForm.reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar contraseña';
      toast.error('Error al cambiar contraseña', { description: message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.info('Función disponible próximamente');
  };

  return (
    <div className="space-y-0">
      {/* Section 1: Avatar */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
          <span className="text-2xl font-semibold text-muted-foreground">
            {getInitials(currentUser.name)}
          </span>
        </div>
        <div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Cambiar foto
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WebP. Máx 2MB.</p>
        </div>
      </div>

      {/* Section 2: Personal info */}
      <div className="border-t border-border pt-6 mt-6 space-y-4">
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
      <div className="border-t border-border pt-6 mt-6 space-y-4">
        <h3 className="text-base font-medium">Seguridad de la cuenta</h3>
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(handleChangePassword)}
            className="space-y-3 max-w-sm"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" loading={isChangingPassword}>
              Cambiar contraseña
            </Button>
          </form>
        </Form>
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
