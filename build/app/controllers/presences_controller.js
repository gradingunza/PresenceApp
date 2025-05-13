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
    OFFICE_COORDS = { lat: -4.319097, lng: 15.283296 };
    MAX_DISTANCE = 55;
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    async index({ auth, view, session, response }) {
        try {
            const user = auth.getUserOrFail();
            const presences = await Presence.query()
                .where('user_id', user.id)
                .orderBy('check_in', 'desc')
                .paginate(1, 30).then(presence => presence.map((p) => {
                p.checkIn = DateTime.fromISO(p.checkIn).setZone('Africa/Kinshasa');
                p.checkOut = p.checkOut ? DateTime.fromISO(p.checkOut).setZone('Africa/Kinshasa') : null;
                return p;
            }));
            console.log('presences new: ', presences);
            const today = DateTime.now().startOf('day');
            const hasCheckedInToday = (await Presence.query()
                .where('user_id', user.id)
                .where('check_in', '>=', today.toISO())
                .whereNull('check_out')
                .first()) !== null;
            return view.render('pages/index', {
                presences,
                hasCheckedIn: hasCheckedInToday,
                success: session.get('success'),
                error: session.get('error'),
            });
        }
        catch (error) {
            session.flash('error', 'Une erreur est survenue lors de la récupération des présences');
            return response.redirect().back();
        }
    }
    async checkIn({ auth, request, response, session }) {
        try {
            const user = auth.getUserOrFail();
            const { latitude, longitude } = request.only(['latitude', 'longitude']);
            if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
                return response.status(400).json({
                    success: false,
                    message: 'Coordonnées GPS invalides'
                });
            }
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const timeZone = 'Africa/Kinshasa';
            const now = DateTime.now().setZone(timeZone);
            const todayStart = now.startOf('day').toUTC().toISO();
            const todayEnd = now.endOf('day').toUTC().toISO();
            console.log(todayStart);
            if (!todayStart || !todayEnd) {
                throw new Error('Impossible de générer les dates de requête');
            }
            const existingPresence = await Presence.query()
                .where('user_id', user.id)
                .where('check_in', '>=', todayStart)
                .where('check_in', '<=', todayEnd)
                .whereNull('check_out')
                .first();
            if (existingPresence) {
                return response.status(400).json({
                    success: false,
                    message: 'Vous avez déjà un check-in sans check-out aujourd\'hui'
                });
            }
            const distance = this.calculateDistance(lat, lng, this.OFFICE_COORDS.lat, this.OFFICE_COORDS.lng);
            if (distance > this.MAX_DISTANCE) {
                return response.status(400).json({
                    success: false,
                    message: `Vous êtes à ${Math.round(distance)}m du bureau. Distance maximale autorisée: ${this.MAX_DISTANCE}m`
                });
            }
            const kinshasaTime = DateTime.now().setZone('Africa/Kinshasa');
            const present = await Presence.create({
                userId: user.id,
                checkIn: DateTime.now().setZone('Africa/Kinshasa'),
                status: distance > 20 ? 'present' : 'present',
                latitude: lat,
                longitude: lng,
            });
            console.log(kinshasaTime);
            console.log('create attendances', present.checkIn);
            session.flash('success', `Check-in enregistré à ${Math.round(distance)}m du bureau`);
            return response.json({
                success: true,
                message: `Check-in réussi à ${Math.round(distance)}m du bureau`,
                redirect: request.header('referer') || '/'
            });
        }
        catch (error) {
            console.error('CheckIn error:', error);
            return response.status(500).json({
                success: false,
                message: `Erreur lors du check-in: ${error.message}`
            });
        }
    }
    async checkOut({ auth, response, session }) {
        try {
            const user = auth.getUserOrFail();
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
        const user = auth.getUserOrFail();
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
                    duration = formatDuration(presence.checkIn.setZone('Africa/Kinshasa').toJSDate(), presence.checkOut.toJSDate());
                }
                return {
                    ...presence.serialize(),
                    checkIn: presence.checkIn?.setZone('Africa/Kinshasa'),
                    checkOut: presence.checkOut?.toISO(),
                    formattedCheckIn,
                    formattedCheckOut,
                    duration,
                    user: presence.user.serialize()
                };
            });
            console.log(presences);
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