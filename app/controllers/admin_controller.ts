import type { HttpContext } from '@adonisjs/core/http';
import User from '#models/user';
import Presence from '#models/presence';
import { DateTime } from 'luxon';

export default class AdminController {
  public async index({ view }: HttpContext) {
    try {
      console.log('AdminController.index: Tentative de rendu du tableau de bord.');
      return view.render('pages/dashboard');
    } catch (error) {
      console.error('AdminController.index: Erreur lors du rendu du tableau de bord:', error);
      return view.render('pages/home', { message: 'Erreur lors de l\'accès au tableau de bord.' });
    }
  }

  public async dashboard({ view, session }: HttpContext) {
    try {
      console.log('AdminController.dashboard: Tentative de récupération de tous les utilisateurs.');
      const users = await User.all();
      console.log('AdminController.dashboard: Utilisateurs récupérés avec succès.', users.length);
      return view.render('pages/dashboard', { users });
    } catch (error) {
      console.error('AdminController.dashboard: Erreur lors de la récupération des utilisateurs:', error);
      session.flash('error', 'Erreur lors de la récupération des utilisateurs.');
      return view.render('pages/error', { message: 'Erreur lors de la récupération des utilisateurs.' });
    }
  }

  public async deleteUser({ params, response, session }: HttpContext) {
    try {
      console.log('AdminController.deleteUser: Tentative de suppression de l\'utilisateur avec l\'ID:', params.id);
      const user = await User.findOrFail(params.id);
      console.log('AdminController.deleteUser: Utilisateur trouvé:', user.serialize());

      // Empêche la suppression des admins
      if (user.roleId === 2) { // 2 = ADMIN
        console.warn('AdminController.deleteUser: Tentative de suppression d\'un administrateur.');
        session.flash('error', 'Impossible de supprimer un administrateur');
        return response.redirect().back();
      }

      await user.delete();
      console.log('AdminController.deleteUser: Utilisateur supprimé avec succès.');
      session.flash('success', 'Utilisateur supprimé avec succès');
      return response.redirect().toRoute('admin.dashboard'); // Rediriger vers la liste des utilisateurs
    } catch (error) {
      console.error('AdminController.deleteUser: Erreur lors de la suppression de l\'utilisateur:', error);
      session.flash('error', 'Erreur lors de la suppression de l\'utilisateur.');
      return response.redirect().toRoute('loginPost'); // Rediriger vers la liste des utilisateurs
    }
  }

  
  public async viewDailyPresences({ view }: HttpContext) {
   
    try {
      
      // 1. Configuration du fuseau horaire
      const timeZone = 'Africa/Kinshasa';
      const now = DateTime.now().setZone(timeZone);
      
      // 2. Définition de la plage de la journée avec vérification de null
      const todayStart = now.startOf('day').toUTC().toISO();
      const todayEnd = now.endOf('day').toUTC().toISO();
  
      if (!todayStart || !todayEnd) {
        throw new Error('Impossible de générer les dates de requête');
      }
  
      // 3. Récupération des présences avec conversion du fuseau horaire
      const presences = await Presence.query()
        .preload('user')
        .whereBetween('check_in', [todayStart, todayEnd])
        .orderBy('check_in', 'desc')
        .then(results => results.map(presence => {
          // Formatage des heures avec vérification de null
          const formatTime = (date: DateTime | null) => 
            date?.setZone(timeZone).toFormat('HH:mm') ?? '-';
  
          // Calcul de la durée
          let duration = '-';
          if (presence.checkIn && presence.checkOut) {
            const checkIn = presence.checkIn.setZone(timeZone);
            const checkOut = presence.checkOut.setZone(timeZone);
            const diff = checkOut.diff(checkIn, ['hours', 'minutes']);
            duration = `${diff.hours}h${diff.minutes.toString().padStart(2, '0')}`;
          }
  
          return {
            ...presence.serialize(),
            formattedCheckIn: formatTime(presence.checkIn),
            formattedCheckOut: formatTime(presence.checkOut),
            duration,
            user: presence.user.serialize(),
          };
        }));
  
      // 4. Renvoi des données à la vue
      return view.render('pages/daily_presence', {
        presences,
        today: now.toFormat('dd/MM/yyyy'),
        todayLabel: now.setLocale('fr').toFormat("cccc d LLLL"),
      });
  
    } catch (error) {
      console.error('Erreur dans viewDailyPresences:', error);
      return view.render('pages/error', {
        message: 'Une erreur est survenue lors de la récupération des présences quotidiennes.',
      });
    }
  }

  public async getAllPresences({ view }: HttpContext) {
    try {
      const presences = await Presence.query().preload('user');
      return view.render('pages/presences', { presences });
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les présences:', error);
      return view.render('pages/error', {
        message: 'Erreur lors de la récupération de toutes les présences.',
      });
    }
  }
}
  

  

