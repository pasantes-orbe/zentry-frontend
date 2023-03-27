import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, CanActivate } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';
import { OwnerGuard } from './guards/owner.guard';
import { SecurityGuard } from './guards/security.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/splash-screen/splash-screen.module').then( m => m.SplashScreenPageModule)
  },
  {
    path: 'splash-screen',
    loadChildren: () => import('./pages/splash-screen/splash-screen.module').then( m => m.SplashScreenPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [OwnerGuard]
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('./pages/account/edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: 'cambiar-clave',
    loadChildren: () => import('./pages/account/password-change/password-change.module').then( m => m.PasswordChangePageModule)
  },
  {
    path: 'ingresos-y-autorizaciones',
    loadChildren: () => import('./pages/registrations/incomes/incomes.module').then( m => m.IncomesPageModule)
  },
  {
    path: 'password-recover',
    loadChildren: () => import('./modals/auth/password-recover/password-recover.module').then( m => m.PasswordRecoverPageModule)
  },
  {
    path: 'ingresos-autorizados',
    loadChildren: () => import('./pages/incomes/auth-incomes/auth-incomes.module').then( m => m.AuthIncomesPageModule)
  },
  {
    path: 'nueva-autorizacion',
    loadChildren: () => import('./pages/incomes/new-income/new-income.module').then( m => m.NewIncomePageModule)
  },
  {
    path: 'vigiladores/home',
    loadChildren: () => import('./pages/guards/home/home.module').then( m => m.HomePageModule),
    canActivate: [SecurityGuard]
  },
  {
    path: 'admin/home',
    loadChildren: () => import('./pages/admin/home/home.module').then( m => m.HomePageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'reservar',
    loadChildren: () => import('./pages/event-reservation/event-reservation.module').then( m => m.EventReservationPageModule)
  },
  {
    path: 'checkin-y-checkout',
    loadChildren: () => import('./pages/guards/menu/registers/check-in-and-check-out/check-in-and-check-out.module').then( m => m.CheckInAndCheckOutPageModule),
    canActivate: [SecurityGuard]
  },
  {
    path: 'admin/country-dashboard',
    loadChildren: () => import('./pages/admin/country-dashboard/country-dashboard.module').then( m => m.CountryDashboardPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/ver-propiedades',
    loadChildren: () => import('./pages/admin/country-properties/view/view.module').then( m => m.ViewPageModule),
    canActivate: [AdminGuard]
  },

  {
    path: 'admin/ver-propietarios',
    loadChildren: () => import('./pages/admin/country-owners/view/view.module').then( m => m.ViewPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/ver-amenities',
    loadChildren: () => import('./pages/admin/country-amenities/view-all/view-all.module').then( m => m.ViewAllPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/registro-checkin-y-checkout',
    loadChildren: () => import('./pages/admin/guard-segment/checkin-out-historial/checkin-out-historial.module').then( m => m.CheckinOutHistorialPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/todos-los-guardias',
    loadChildren: () => import('./pages/admin/guard-segment/all-guards/all-guards.module').then( m => m.AllGuardsPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/agregar-country',
    loadChildren: () => import('./pages/admin/add-country/add-country.module').then( m => m.AddCountryPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/invitados-recurrentes',
    loadChildren: () => import('./pages/admin/country-recurrents/country-recurrents.module').then( m => m.CountryRecurrentsPageModule)
  },
  {
    path: 'admin/registro-de-eventos',
    loadChildren: () => import('./pages/admin/events-segment/events-historial/events-historial.module').then( m => m.EventsHistorialPageModule)
  },
  {
    path: 'admin/registro-de-antipanico',
    loadChildren: () => import('./pages/admin/guard-segment/antipanic-historial/antipanic-historial.module').then( m => m.AntipanicHistorialPageModule)
  },
  {
    path: 'admin/nueva-propiedad',
    loadChildren: () => import('./pages/admin/country-properties/add-property/add-property.module').then( m => m.AddPropertyPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/nuevo-lugar-de-reserva',
    loadChildren: () => import('./pages/admin/country-amenities/add-amenity/add-amenity.module').then( m => m.AddAmenityPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/nuevo-propietario',
    loadChildren: () => import('./pages/admin/country-owners/add-country-owner/add-country-owner.module').then( m => m.AddCountryOwnerPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/nuevo-vigilador',
    loadChildren: () => import('./pages/admin/guard-segment/add-guard/add-guard.module').then( m => m.AddGuardPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/asignar-propiedad',
    loadChildren: () => import('./pages/admin/country-owners/assign-country-to-owner/assign-country-to-owner.module').then( m => m.AssignCountryToOwnerPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/solicitudes-de-contrasena',
    loadChildren: () => import('./pages/admin/password-requests/password-requests/password-requests.module').then( m => m.PasswordRequestsPageModule)
  },
  {
    path: 'admin/agregar-horario-laboral',
    loadChildren: () => import('./pages/admin/guard-segment/add-laboral-schedule/add-laboral-schedule.module').then( m => m.AddLaboralSchedulePageModule)
  },
  {
    path: 'ver-eventos',
    loadChildren: () => import('./pages/guards/events/view-events/view-events.module').then( m => m.ViewEventsPageModule)
  },  {
    path: 'edit-guard',
    loadChildren: () => import('./modals/guards/edit-guard/edit-guard.module').then( m => m.EditGuardPageModule)
  },




  
 

  










  // {
  //   path: 'authorizations',
  //   loadChildren: () => import('./pages/guards/authorizations/authorizations.module').then( m => m.AuthorizationsPageModule)
  // },
  // {
  //   path: 'checkin',
  //   loadChildren: () => import('./pages/guards/checkin/checkin.module').then( m => m.CheckinPageModule)
  // },
  // {
  //   path: 'checkout',
  //   loadChildren: () => import('./pages/guards/checkout/checkout.module').then( m => m.CheckoutPageModule)
  // }









];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
