export default class IsAdminMiddleware {
    async handle(ctx, next) {
        if (!ctx.auth.isAuthenticated) {
            return ctx.response.redirect().toPath('/login');
        }
        const user = ctx.auth.user;
        if (!user) {
            return ctx.response.redirect().toPath('/login');
        }
        try {
            await user.load('role');
            if (user.role?.roleName !== 'Admin') {
                ctx.session.flash('error', 'Accès réservé aux administrateurs');
                return ctx.response.redirect().toPath('/home');
            }
            return await next();
        }
        catch (error) {
            ctx.logger.error(error, 'Erreur de vérification du rôle admin');
            ctx.session.flash('error', 'Erreur technique');
            return ctx.response.redirect().toPath('/home');
        }
    }
}
//# sourceMappingURL=is_admin_middleware.js.map