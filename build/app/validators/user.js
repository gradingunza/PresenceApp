import vine from '@vinejs/vine';
const messages = {
    required: '<span class="text-red-500">Ce champ est obligatoire</span>',
    minLength: (_args) => `<span class="text-red-500">Doit contenir au moins ${_args.minLength} caractères</span>`,
    maxLength: (_args) => `<span class="text-red-500">Ne doit pas dépasser ${_args.maxLength} caractères</span>`,
    email: '<span class="text-red-500">Adresse email invalide</span>',
    unique: '<span class="text-red-500">Cette valeur est déjà utilisée</span>',
    alpha: '<span class="text-red-500">Ne doit contenir que des lettres</span>',
    confirmed: '<span class="text-red-500">Les mots de passe ne correspondent pas</span>',
    default: (field) => `<span class="text-red-500">Validation échouée pour ${typeof field === 'string' ? field : JSON.stringify(field)}</span>`
};
vine.messagesProvider = {
    getMessage(field, rule, _args) {
        const message = messages[rule];
        return typeof message === 'function'
            ? message(_args || {})
            : messages.default(field);
    }
};
export const createUserValidator = vine.compile(vine.object({
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
        .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first();
        return !user;
    }),
    password: vine
        .string()
        .trim()
        .minLength(6)
        .maxLength(255)
        .confirmed(),
    password_confirmation: vine
        .string()
        .trim()
        .minLength(6)
        .maxLength(255)
}));
//# sourceMappingURL=user.js.map