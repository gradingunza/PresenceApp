import { HttpContext } from '@adonisjs/core/http';
import User from '#models/user';

export default class IsAdminMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    // 1. Authentification
    if (!ctx.auth.isAuthenticated) {
      return ctx.response.redirect().toPath('/login');
    }

    // 2. Typage sécurisé
    const user = ctx.auth.user as User | null;
    if (!user) {
      return ctx.response.redirect().toPath('/login');
    }

    // 3. Chargement du rôle avec gestion d'erreur
    try {
      await user.load('role');
      // Correction : Utilisation de roleName pour vérifier le rôle
      if (user.role?.roleName !== 'Admin') {
        ctx.session.flash('error', 'Accès réservé aux administrateurs');
        return ctx.response.redirect().toPath('/home');
      }

      return await next();
    } catch (error) {
      ctx.logger.error(error, 'Erreur de vérification du rôle admin');
      ctx.session.flash('error', 'Erreur technique');
      return ctx.response.redirect().toPath('/home');
    }
  }
}
