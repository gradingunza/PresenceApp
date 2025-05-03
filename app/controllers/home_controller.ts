import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon';


export default class HomeController {

    
    public async home({ view }: { view: HttpContext['view'] }) {
        const someDate = DateTime.now();
        const formattedDate = someDate.toFormat('yyyy-MM-dd HH:mm:ss'); // Exemple de format
        return view.render('pages/home', { formattedDate });
    }
    
    
}
