// src/app/routes/routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash-screen', // O tu ruta inicial
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () => import('../pages/auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'splash-screen',
    loadChildren: () => import('../pages/splash-screen/splash-screen.module').then(m => m.SplashScreenPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('../tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'admin/home',
    loadChildren: () => import('../pages/admin/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'admin/country-dashboard',
    loadChildren: () => import('../pages/admin/country-dashboard/country-dashboard.module').then(m => m.CountryDashboardPageModule)
  },
  {
    path: 'admin/add-country',
    loadChildren: () => import('../pages/admin/add-country/add-country.module').then(m => m.AddCountryPageModule)
  },
  {
    path: 'admin/country-amenities/view-all',
    loadChildren: () => import('../pages/admin/country-amenities/view-all/view-all.module').then(m => m.ViewAllPageModule)
  },
  {
    path: 'admin/country-owners/view',
    loadChildren: () => import('../pages/admin/country-owners/view/view.module').then(m => m.ViewPageModule)
  },
  {
    path: 'admin/country-properties/view',
    loadChildren: () => import('../pages/admin/country-properties/view/view.module').then(m => m.ViewPageModule)
  },
  {
    path: 'admin/country-recurrents',
    loadChildren: () => import('../pages/admin/country-recurrents/country-recurrents.module').then(m => m.CountryRecurrentsPageModule)
  },
  {
    path: 'admin/events-segment/events-historial',
    loadChildren: () => import('../pages/admin/events-segment/events-historial/events-historial.module').then(m => m.EventsHistorialPageModule)
  },
  {
    path: 'admin/guard-segment/all-guards',
    loadChildren: () => import('../pages/admin/guard-segment/all-guards/all-guards.module').then(m => m.AllGuardsPageModule)
  },
  {
    path: 'admin/guard-segment/antipanic-historial',
    loadChildren: () => import('../pages/admin/guard-segment/antipanic-historial/antipanic-historial.module').then(m => m.AntipanicHistorialPageModule)
  },
  {
    path: 'admin/guard-segment/checkin-out-historial',
    loadChildren: () => import('../pages/admin/guard-segment/checkin-out-historial/checkin-out-historial.module').then(m => m.CheckinOutHistorialPageModule)
  },
  {
    path: 'admin/map-guards',
    loadChildren: () => import('../pages/admin/map-guards/map-guards.module').then(m => m.MapGuardsPageModule)
  },
  {
    path: 'admin/solicitudes-de-contrasena',
    loadChildren: () => import('../pages/admin/password-requests/password-requests/password-requests.module').then(m => m.PasswordRequestsPageModule)
  },
  {
    path: 'guards/home',
    loadChildren: () => import('../pages/guards/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'guards/authorizations',
    loadChildren: () => import('../pages/guards/authorizations/authorizations.module').then(m => m.AuthorizationsPageModule)
  },
  {
    path: 'guards/checkin',
    loadChildren: () => import('../pages/guards/checkin/checkin.module').then(m => m.CheckinPageModule)
  },
  {
    path: 'guards/checkout',
    loadChildren: () => import('../pages/guards/checkout/checkout.module').then(m => m.CheckoutPageModule)
  },
  {
    path: 'ver-eventos',
    loadChildren: () => import('../pages/guards/events/view-events/view-events.module').then(m => m.ViewEventsPageModule)
  },
  {
    path: 'guards-schedule',
    loadChildren: () => import('../pages/guardsSchedule/guards-schedule/guards-schedule.module').then(m => m.GuardsSchedulePageModule)
  },
  {
    path: 'ingresos-autorizados',
    loadChildren: () => import('../pages/incomes/auth-incomes/auth-incomes.module').then(m => m.AuthIncomesPageModule)
  },
  {
    path: 'nueva-autorizacion',
    loadChildren: () => import('../pages/incomes/new-income/new-income.module').then(m => m.NewIncomePageModule)
  },
  {
    path: 'registros',
    loadChildren: () => import('../pages/registrations/incomes/incomes.module').then(m => m.IncomesPageModule)
  },
  {
    path: 'reservar',
    loadChildren: () => import('../pages/event-reservation/event-reservation.module').then(m => m.EventReservationPageModule)
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('../pages/account/edit/edit.module').then(m => m.EditPageModule)
  },
  {
    path: 'cambiar-contrasena',
    loadChildren: () => import('../pages/account/password-change/password-change.module').then(m => m.PasswordChangePageModule)
  },
  // ... y así con todas las demás rutas que falten
];
