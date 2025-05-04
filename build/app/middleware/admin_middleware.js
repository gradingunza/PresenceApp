export default class IsAdminMiddleware {
    async handle(ctx, next) {
        if (!ctx.auth.isAuthenticated) {
            ctx.session.flash('error', 'Vous devez être connecté pour accéder à cette page.');
            return ctx.response.redirect().toPath('/login');
        }
        const user = ctx.auth.user;
        if (!user) {
            ctx.session.flash('error', 'Utilisateur non trouvé.');
            return ctx.response.redirect().toPath('/login');
        }
        await user.load('role');
        if (user.role?.roleName !== 'Admin') {
            ctx.session.flash('error', 'Accès refusé.  Réservé aux administrateurs.');
            return ctx.response.redirect().toPath('/home');
        }
        await next();
    }
}
//# sourceMappingURL=admin_middleware.js.map