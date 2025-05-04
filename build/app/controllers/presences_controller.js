import Presence from '#models/presence';
import { DateTime } from 'luxon';
function formatDuration(start, end) {
    const startDate = DateTime.fromJSDate(start);
    const endDate = DateTime.fromJSDate(end);
    const diff = endDate.diff(startDate, ['hours', 'minutes']).toObject();
    const hours = Math.floor(diff.hours !== undefined ? diff.hours : 0);
    const minutes = Math.floor(diff.minutes !== undefined ? diff.minutes : 0);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
}
export default class PresencesController {
    async index({ auth, view, session }) {
        try {
            const user = await auth.getUserOrFail();
            const presences = await Presence.query()
                .where('user_id', user.id)
                .orderBy('check_in', 'desc')
                .paginate(1, 30);
            const today = DateTime.now().startOf('day');
            const hasCheckedInToday = await Presence.query()
                .where('user_id', user.id)
                .where('check_in', '>=', today.toISO())
                .whereNull('check_out')
                .first() !== null;
            return view.render('pages/index', {
                presences,
                hasCheckedIn: hasCheckedInToday,
                success: session.get('success'),
                error: session.get('error'),
            });
        }
        catch (error) {
            session.flash('error', 'Une erreur est survenue lors de la récupération des présences');
            return view.render('pages/index', { presences: [], hasCheckedIn: false });
        }
    }
    async checkIn({ auth, response, session }) {
        try {
            const user = await auth.getUserOrFail();
            const todayStart = DateTime.now().startOf('day').toISO();
            const todayEnd = DateTime.now().endOf('day').toISO();
            const existingPresence = await Presence.query()
                .where('user_id', user.id)
                .whereBetween('check_in', [todayStart, todayEnd])
                .whereNull('check_out')
                .first();
            if (existingPresence) {
                session.flash('error', 'Vous avez déjà un check-in sans check-out aujourd\'hui');
                return response.redirect().back();
            }
            await Presence.create({
                userId: user.id,
                checkIn: DateTime.now(),
                status: 'present',
            });
            session.flash('success', 'Check-in enregistré avec succès');
            return response.redirect().toRoute('presences.report');
        }
        catch (error) {
            console.error('Erreur checkIn:', error);
            session.flash('error', 'Erreur lors de l\'enregistrement du check-in');
            return response.redirect().toRoute('presences.report');
        }
    }
    async checkOut({ auth, response, session }) {
        try {
            const user = await auth.getUserOrFail();
            const todayStart = DateTime.now().startOf('day').toISO();
            const todayEnd = DateTime.now().endOf('day').toISO();
            const presence = await Presence.query()
                .where('user_id', user.id)
                .whereBetween('check_in', [todayStart, todayEnd])
                .whereNull('check_out')
                .firstOrFail();
            presence.checkOut = DateTime.now();
            await presence.save();
            session.flash('success', 'Check-out enregistré avec succès');
            return response.redirect().toRoute('presences.report');
        }
        catch (error) {
            console.error('Erreur checkOut:', error);
            session.flash('error', 'Erreur lors de l\'enregistrement du check-out');
            return response.redirect().back();
        }
    }
    async report({ auth, view, request }) {
        const user = await auth.getUserOrFail();
        let query = Presence.query().where('user_id', user.id).orderBy('check_in', 'desc');
        if (request.input('user_id')) {
            query = query.where('user_id', request.input('user_id'));
        }
        const presences = await query.paginate(1, 30);
        return view.render('pages/report', {
            presences,
            allUsers: [],
            selectedUserId: request.input('user_id') || '',
        });
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
                let duration = null;
                let formattedCheckIn = presence.checkIn?.toFormat('HH:mm') || null;
                let formattedCheckOut = presence.checkOut?.toFormat('HH:mm') || null;
                if (presence.checkIn && presence.checkOut) {
                    duration = formatDuration(presence.checkIn.toJSDate(), presence.checkOut.toJSDate());
                }
                return {
                    ...presence.serialize(),
                    checkIn: presence.checkIn?.toISO(),
                    checkOut: presence.checkOut?.toISO(),
                    formattedCheckIn,
                    formattedCheckOut,
                    duration,
                    user: presence.user.serialize()
                };
            });
            return view.render('pages/daily_presence', {
                presences,
                today,
                todayLabel
            });
        }
        catch (error) {
            console.error('Erreur:', error);
            return view.render('pages/error', {
                message: 'Erreur lors de la récupération des données.'
            });
        }
    }
}
//# sourceMappingURL=presences_controller.js.map