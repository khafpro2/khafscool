import { z } from 'zod';

export const displayNameField = z
  .string({ required_error: 'Nom d\'affichage requis' })
  .trim()
  .min(1, 'Le nom d\'affichage est requis')
  .max(100, 'Le nom d\'affichage ne peut pas dépasser 100 caractères');

export const registerSchema = z.object({  email: z.string({ required_error: 'Adresse e-mail requise' }).email('Adresse e-mail invalide'),
  password: z
    .string({ required_error: 'Mot de passe requis' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  displayName: displayNameField,
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Adresse e-mail requise' }).email('Adresse e-mail invalide'),
  password: z.string({ required_error: 'Mot de passe requis' }).min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional(),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Jeton de rafraîchissement requis' })
    .min(1, 'Jeton de rafraîchissement requis'),
});

export const updateProfileSchema = z.object({
  displayName: displayNameField,
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Mot de passe actuel requis' })
    .min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string({ required_error: 'Nouveau mot de passe requis' })
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
});

export const oauthSessionExchangeSchema = z.object({
  sessionCode: z.string().min(1, 'sessionCode requis'),
});

export const deleteAccountSchema = z.object({
  confirm: z.literal('SUPPRIMER', {
    errorMap: () => ({ message: 'Saisis SUPPRIMER pour confirmer la suppression' }),
  }),
  currentPassword: z.string().min(1, 'Mot de passe actuel requis').optional(),
});

export function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}
