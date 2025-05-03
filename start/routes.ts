/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = ()=> import('#controllers/auth_controller')
const HomeController = ()=> import('#controllers/home_controller')
const PresenceController = ()=> import('#controllers/presences_controller')
const AdminController = () => import('#controllers/admin_controller')


router.get('/', [AuthController, 'loginPost']).as('loginPost')
router.post('/', [AuthController, 'login']).as('login')
router.get('/registerPost', [AuthController, 'registerPost']).as('registerPost')
router.post('/registerPost', [AuthController, 'register']).as('register')
router.get('/presences', [AdminController, 'getAllPresences']).as('presences')



router.group(() => {
  router.get('home', [HomeController, 'home']).as('home')
  router.post('/logout', [AuthController, 'logout']).as('logout')
  router.get('/daily_presence', [AdminController, 'viewDailyPresences']).as('admin.dailyPresences')
  router.get('/index', [PresenceController,'index']).as('presences.index')
  router.post('/checkIn', [PresenceController,'checkIn']).as('presences.checkIn')
  router.post('/checkOut', [PresenceController,'checkOut']).as('presences.checkOut')
  router.get('/report', [PresenceController,'report']).as('presences.report')
  router.post('/admin/users/:id/delete', [AdminController,'deleteUser']).as('admin.deleteUser')
  router.get('/dashboard', [AdminController, 'dashboard']).as('admin.dashboard')
}).middleware(middleware.auth())


