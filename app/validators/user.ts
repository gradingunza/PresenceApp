import vine from '@vinejs/vine'

// Configuration des messages d'erreur
// Messages avec balises span pour le style rouge
const messages = {
  required: '<span class="text-red-500">Ce champ est obligatoire</span>',
  minLength: (_args: Record<string, any>) => `<span class="text-red-500">Doit contenir au moins ${_args.minLength} caractères</span>`,
  maxLength: (_args: Record<string, any>) => `<span class="text-red-500">Ne doit pas dépasser ${_args.maxLength} caractères</span>`,
  email: '<span class="text-red-500">Adresse email invalide</span>',
  unique: '<span class="text-red-500">Cette valeur est déjà utilisée</span>',
  alpha: '<span class="text-red-500">Ne doit contenir que des lettres</span>',
  confirmed: '<span class="text-red-500">Les mots de passe ne correspondent pas</span>',
  default: (field: string | Record<string, any>) => `<span class="text-red-500">Validation échouée pour ${typeof field === 'string' ? field : JSON.stringify(field)}</span>`
}

vine.messagesProvider = {
  getMessage(
    field: string,
    rule: keyof typeof messages,
    _args?: Record<string, any>
  ) {
    const message = messages[rule];
    return typeof message === 'function'
      ? message(_args || {})
      : messages.default(field);
  }
}

// Validateur utilisateur
export const createUserValidator = vine.compile(
  vine.object({
    firstName: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(255)
      .alpha({
        allowSpaces: true,
        allowDashes: false
      }),

    name: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(255),

    email: vine
      .string()
      .trim()
      .email()
      .maxLength(255)
      .unique(async (db: any, value: string) => { // Ajout de type pour db et value
        const user = await db.from('users').where('email', value).first()
        return !user
      }),

    password: vine
      .string()
      .trim()
      .minLength(6)
      .maxLength(255)
      .confirmed(),

    password_confirmation: vine // Ajout du champ password_confirmation requis par .confirmed()
      .string()
      .trim()
      .minLength(6)
      .maxLength(255)
  })
)