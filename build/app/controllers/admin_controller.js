import User from '#models/user';
import Presence from '#models/presence';
import { DateTime } from 'luxon';
export default class AdminController {
    async index({ view }) {
        try {
            console.log('AdminController.index: Tentative de rendu du tableau de bord.');
            return view.render('pages/dashboard');
        }
        catch (error) {
            console.error('AdminController.index: Erreur lors du rendu du tableau de bord:', error);
            return view.render('pages/home', { message: 'Erreur lors de l\'accès au tableau de bord.' });
        }
    }
    async dashboard({ view, session }) {
        try {
            console.log('AdminController.dashboard: Tentative de récupération de tous les utilisateurs.');
            const users = await User.all();
            console.log('AdminController.dashboard: Utilisateurs récupérés avec succès.', users.length);
            return view.render('pages/dashboard', { users });
        }
        catch (error) {
            console.error('AdminController.dashboard: Erreur lors de la récupération des utilisateurs:', error);
            session.flash('error', 'Erreur lors de la récupération des utilisateurs.');
            return view.render('pages/error', { message: 'Erreur lors de la récupération des utilisateurs.' });
        }
    }
    async deleteUser({ params, response, session }) {
        try {
            console.log('AdminController.deleteUser: Tentative de suppression de l\'utilisateur avec l\'ID:', params.id);
            const user = await User.findOrFail(params.id);
            console.log('AdminController.deleteUser: Utilisateur trouvé:', user.serialize());
            if (user.roleId === 2) {
                console.warn('AdminController.deleteUser: Tentative de suppression d\'un administrateur.');
                session.flash('error', 'Impossible de supprimer un administrateur');
                return response.redirect().back();
            }
            await user.delete();
            console.log('AdminController.deleteUser: Utilisateur supprimé avec succès.');
            session.flash('success', 'Utilisateur supprimé avec succès');
            return response.redirect().toRoute('admin.dashboard');
        }
        catch (error) {
            console.error('AdminController.deleteUser: Erreur lors de la suppression de l\'utilisateur:', error);
            session.flash('error', 'Erreur lors de la suppression de l\'utilisateur.');
            return response.redirect().toRoute('loginPost');
        }
    }
    async viewDailyPresences({ view }) {
        try {
            const today = DateTime.now().toFormat('dd/MM/yyyy');
            const todayLabel = DateTime.now().setLocale('fr').toFormat("cccc d LLLL");
            const todayStart = DateTime.now().startOf('day').toSQLDate();
            const presencesRaw = await Presence.query()
                .preload('user')
                .whereRaw('DATE(check_in) = ?', [todayStart])
                .orderBy('check_in', 'desc');
            const presences = presencesRaw.map((presence) => {
                let duration = '-';
                let formattedCheckIn = '-';
                let formattedCheckOut = '-';
                if (presence.checkIn) {
                    formattedCheckIn = presence.checkIn.toFormat('HH:mm');
                }
                if (presence.checkOut) {
                    formattedCheckOut = presence.checkOut.toFormat('HH:mm');
                }
                if (presence.checkIn && presence.checkOut) {
                    const diff = presence.checkOut.diff(presence.checkIn, ['hours', 'minutes']);
                    duration = `${diff.hours}h${String(diff.minutes).padStart(2, '0')}`;
                }
                return {
                    ...presence.serialize(),
                    formattedCheckIn,
                    formattedCheckOut,
                    duration,
                    user: presence.user.serialize(),
                };
            });
            return view.render('pages/daily_presence', {
                presences,
                today,
                todayLabel,
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des présences quotidiennes:', error);
            return view.render('pages/error', {
                message: 'Erreur lors de la récupération des présences quotidiennes.',
            });
        }
    }
    async getAllPresences({ view }) {
        try {
            const presences = await Presence.query().preload('user');
            return view.render('pages/presences', { presences });
        }
        catch (error) {
            console.error('Erreur lors de la récupération de toutes les présences:', error);
            return view.render('pages/error', {
                message: 'Erreur lors de la récupération de toutes les présences.',
            });
        }
    }
}
//# sourceMappingURL=admin_controller.js.map