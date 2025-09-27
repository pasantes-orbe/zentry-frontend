import { Routes } from '@angular/router';

// import { OwnerGuard } from './services/auth/guards/owner.guard';
// import { AdminGuard } from './services/auth/guards/admin.guard';
// import { SecurityGuard } from './services/auth/guards/security.guard';

export const routes: Routes = [
  // ───────────────────────────────────────────────────────────────────────────────
  // FLUJO INICIAL / PÚBLICO
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'splash-screen',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/auth/login/login.page')
        .then(m => m.LoginPage),
  },
  {
    path: 'splash-screen',
    loadComponent: () =>
      import('../pages/splash-screen/splash-screen.page')
        .then(m => m.SplashScreenPage),
  },
  {
    path: 'politica-de-privacidad',
    loadComponent: () =>
      import('../pages/politica-de-privacidad/politica-de-privacidad.page')
        .then(m => m.PoliticaDePrivacidadPage),
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // OWNER (tabs)
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: 'home',
    // canMatch: [OwnerGuard],
    loadComponent: () =>
      import('../tabs/tabs.page')
        .then(m => m.TabsPage),
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page')
            .then(m => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page')
            .then(m => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page')
            .then(m => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // GUARDS
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: 'guards/home',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/home/home.page')
        .then(m => m.HomePage),
  },
  {
    path: 'guards/authorizations',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/authorizations/authorizations.page')
        .then(m => m.AuthorizationsPage),
  },
  {
    path: 'check-in-and-check-out',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/menu/registers/check-in-and-check-out/check-in-and-check-out.page')
        .then(m => m.CheckInAndCheckOutPage),
  },
  {
    path: 'view-events',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/events/view-events/view-events.page')
        .then(m => m.ViewEventsPage),
  },
  {
    path: 'checkin',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/checkin/checkin.page')
        .then(m => m.CheckinPage),
  },
  {
    path: 'checkout',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/checkout/checkout.page')
        .then(m => m.CheckoutPage),
  },
  {
    path: 'guards-schedule',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guardsSchedule/guards-schedule/guards-schedule.page')
        .then(m => m.GuardsSchedulePage),
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // ADMIN
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: 'admin/home',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/home/home.page')
        .then(m => m.HomePage),
  },
  {
    path: 'admin/add-country',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/add-country/add-country.page')
        .then(m => m.AddCountryPage),
  },
  {
    path: 'admin/country-dashboard/:id',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-dashboard/country-dashboard.page')
        .then(m => m.CountryDashboardPage),
  },

  // Amenities
  {
    path: 'admin/add-amenity',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-amenities/add-amenity/add-amenity.page')
        .then(m => m.AddAmenityPage),
  },
  {
    path: 'admin/view-all-amenities',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-amenities/view-all/view-all.page')
        .then(m => m.ViewAllPage),
  },

  // Owners
  {
    path: 'admin/add-country-owner',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-owners/add-country-owner/add-country-owner.page')
        .then(m => m.AddCountryOwnerPage),
  },
  {
    path: 'admin/assign-country-to-owner',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-owners/assign-country-to-owner/assign-country-to-owner.page')
        .then(m => m.AssignCountryToOwnerPage),
  },
  {
    path: 'admin/view-owners',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-owners/view/view.page')
        .then(m => m.ViewPage),
  },

  // Properties
  {
    path: 'admin/add-property',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-properties/add-property/add-property.page')
        .then(m => m.AddPropertyPage),
  },
  {
    path: 'admin/view-properties',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-properties/view/view.page')
        .then(m => m.ViewPage),
  },

  // Recurrents (plano)
  {
    path: 'admin/add-recurrent',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/add-recurrent/add-recurrent.page')
        .then(m => m.AddRecurrentPage),
  },
  {
    path: 'admin/country-recurrents',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/country-recurrents.page')
        .then(m => m.RecurrentsViewAllComponent),
  },
  {
    path: 'admin/edit-recurrent/:recurrentId',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/add-recurrent/add-recurrent.page')
        .then(m => m.AddRecurrentPage),
  },

  // Recurrents (canónico con :id)
  {
    path: 'admin/country/:id/recurrents',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/country-recurrents.page')
        .then(m => m.RecurrentsViewAllComponent),
  },
  {
    path: 'admin/country/:id/recurrents/add',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/add-recurrent/add-recurrent.page')
        .then(m => m.AddRecurrentPage),
  },
  {
    path: 'admin/country/:id/recurrents/edit/:recurrentId',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/add-recurrent/add-recurrent.page')
        .then(m => m.AddRecurrentPage),
  },

  // Otros (admin)
  {
    path: 'admin/events-historial',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/events-segment/events-historial/events-historial.page')
        .then(m => m.EventsHistorialPage),
  },
  {
    path: 'admin/add-guard',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/add-guard/add-guard.page')
        .then(m => m.AddGuardPage),
  },
  {
    path: 'admin/add-laboral-schedule',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/add-laboral-schedule/add-laboral-schedule.page')
        .then(m => m.AddLaboralSchedulePage),
  },
  {
    path: 'admin/all-guards',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/all-guards/all-guards.page')
        .then(m => m.AllGuardsPage),
  },
  {
    path: 'admin/antipanic-historial',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/antipanic-historial/antipanic-historial.page')
        .then(m => m.AntipanicHistorialPage),
  },
  {
    path: 'admin/checkin-out-historial',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/checkin-out-historial/checkin-out-historial.page')
        .then(m => m.CheckinOutHistorialPage),
  },
  {
    path: 'admin/password-requests',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/password-requests/password-requests/password-requests.page')
        .then(m => m.PasswordRequestsPage),
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // EXTRAS / LEGACY
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: 'incomes',
    loadComponent: () =>
      import('../pages/registrations/incomes/incomes.page')
        .then(m => m.IncomesPage),
  },
  {
    path: 'auth-incomes',
    loadComponent: () =>
      import('../pages/incomes/auth-incomes/auth-incomes.page')
        .then(m => m.AuthIncomesPage),
  },
  {
    path: 'new-income',
    loadComponent: () =>
      import('../pages/incomes/new-income/new-income.page')
        .then(m => m.NewIncomePage),
  },
  {
    path: 'event-reservation',
    loadComponent: () =>
      import('../pages/event-reservation/event-reservation.page')
        .then(m => m.EventReservationPage),
  },
  {
    path: 'download',
    loadComponent: () =>
      import('../pages/download/download.page')
        .then(m => m.DownloadPage),
  },
  {
    path: 'map-guards',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/map-guards/map-guards.page')
        .then(m => m.MapGuardsPage),
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // CUENTA / PERFIL
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: 'account/edit',
    loadComponent: () =>
      import('../pages/account/edit/edit.page')
        .then(m => m.EditPage),
  },
  {
    path: 'account/password-change',
    loadComponent: () =>
      import('../pages/account/password-change/password-change.page')
        .then(m => m.PasswordChangePage),
  },
  {
    path: 'edit-owner/:id',
    loadComponent: () =>
      import('../modals/owners/edit/edit.page')
        .then(m => m.EditPage),
  },
  {
    path: 'explore-container',
    loadComponent: () =>
      import('../explore-container/explore-container.component')
        .then(m => m.ExploreContainerComponent),
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // CATCH-ALL
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'splash-screen',
  },
];
