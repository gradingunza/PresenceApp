import type { HttpContext } from '@adonisjs/core/http';
import User from '#models/user';
import { createUserValidator } from '#validators/user';


export default class AuthController {
  async loginPost({ view }: HttpContext) {
    return view.render('pages/loginPost');
  }

 // app/controllers/auth_controller.ts
 public async login({ request, auth, session, response }: HttpContext) {
  const { email, password } = request.only(['email', 'password'])

  try {
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)

    // Redirection basée sur le rôle
    const redirectPath = user.roleId === 2 ? '/dashboard' : '/home'
    
    session.flash('success', 'Connexion réussie')
    return response.redirect().toPath(redirectPath)
  } catch (error) {
    session.flash('error', 'Identifiants incorrects')
    return response.redirect().toRoute('registerPost')
  }
}


  public async registerPost({ view }: HttpContext) {
    return view.render('pages/registerPost');
  }

  // Fonction d'enregistrement d'utilisateur améliorée
  public async register({ request, auth, session, response }: HttpContext) {
    try {
      // Valider les données de la requête en utilisant le validateur
      const data = await request.validateUsing(createUserValidator);


      // Créer un nouvel utilisateur dans la base de données
      const user = await User.create({
        firstName: data.firstName,
        name: data.name,
        email: data.email,
        password: data.password, 
      });

      // Connecter l'utilisateur nouvellement enregistré
      await auth.use('web').login(user);

      // Ajouter un message flash de succès
      session.flash('success', 'Inscription réussie!');

      // Rediriger vers la page d'accueil
      return response.redirect().toRoute('home');
    } catch (error) {
      {
        console.error('Erreur lors de l\'inscription:', error); // Pour déboguer
        session.flash('error', 'Erreur lors de l\'inscription. Veuillez réessayer.');
      }
      return response.redirect().toRoute('registerPost'); // Rester sur la page d'inscription
    }
  }

  public async logout({ auth, session, response }: HttpContext) {
    await auth.use('web').logout();
    session.flash('success', 'Déconnexion réussie');
    return response.redirect().toRoute('loginPost');
  }
}
