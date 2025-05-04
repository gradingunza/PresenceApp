import { DateTime } from 'luxon';
export default class HomeController {
    async home({ view }) {
        const someDate = DateTime.now();
        const formattedDate = someDate.toFormat('yyyy-MM-dd HH:mm:ss');
        return view.render('pages/home', { formattedDate });
    }
}
//# sourceMappingURL=home_controller.js.map