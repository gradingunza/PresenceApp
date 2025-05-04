import User from '#models/user';
import { createUserValidator } from '#validators/user';
export default class AuthController {
    async loginPost({ view }) {
        return view.render('pages/loginPost');
    }
    async login({ request, auth, session, response }) {
        const { email, password } = request.only(['email', 'password']);
        try {
            const user = await User.verifyCredentials(email, password);
            await auth.use('web').login(user);
            const redirectPath = user.roleId === 2 ? '/dashboard' : '/home';
            session.flash('success', 'Connexion réussie');
            return response.redirect().toPath(redirectPath);
        }
        catch (error) {
            session.flash('error', 'Identifiants incorrects');
            return response.redirect().toRoute('registerPost');
        }
    }
    async registerPost({ view }) {
        return view.render('pages/registerPost');
    }
    async register({ request, auth, session, response }) {
        try {
            const data = await request.validateUsing(createUserValidator);
            const user = await User.create({
                firstName: data.firstName,
                name: data.name,
                email: data.email,
                password: data.password,
            });
            await auth.use('web').login(user);
            session.flash('success', 'Inscription réussie!');
            return response.redirect().toRoute('home');
        }
        catch (error) {
            {
                console.error('Erreur lors de l\'inscription:', error);
                session.flash('error', 'Erreur lors de l\'inscription. Veuillez réessayer.');
            }
            return response.redirect().toRoute('registerPost');
        }
    }
    async logout({ auth, session, response }) {
        await auth.use('web').logout();
        session.flash('success', 'Déconnexion réussie');
        return response.redirect().toRoute('loginPost');
    }
}
//# sourceMappingURL=auth_controller.js.map