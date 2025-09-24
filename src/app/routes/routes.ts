import { Routes } from '@angular/router';

// Guards por rol (desactivados por ahora para la demo)
// import { OwnerGuard } from './services/auth/guards/owner.guard';
// import { AdminGuard } from './services/auth/guards/admin.guard';
// import { SecurityGuard } from './services/auth/guards/security.guard';

export const routes: Routes = [
  /**
   * FLUJO INICIAL:
   * Arranca en splash-screen. Desde ahí, según login/rol, redirige a:
   * - Propietario: /home (tabs)
   * - Guardia: /guards/home
   * - Admin: /admin/home
   */
  {
    path: '',
    redirectTo: 'splash-screen',
    pathMatch: 'full',
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // PÚBLICO (acceso sin autenticación)
  // ───────────────────────────────────────────────────────────────────────────────

  /** Pantalla de Login (Formulario y envío al rol correspondiente) */
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/auth/login/login.page').then(m => m.LoginPage)
  },

  /** Splash/Loader inicial (decide a dónde ir según estado del usuario) */
  {
    path: 'splash-screen',
    loadComponent: () =>
      import('../pages/splash-screen/splash-screen.page').then(m => m.SplashScreenPage)
  },

  /** Página estática de política de privacidad */
  {
    path: 'politica-de-privacidad',
    loadComponent: () =>
      import('../pages/politica-de-privacidad/politica-de-privacidad.page').then(m => m.PoliticaDePrivacidadPage)
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // ÁREA PROPIETARIO (OWNER) — Tabs (Home de propietario)
  // TODO: cuando actives auth, descomentar canMatch: [OwnerGuard]
  // ───────────────────────────────────────────────────────────────────────────────
  /**
   * FLUJO OWNER:
   * /home → Tabs con:
   *   - /home/tab1: tablero (acciones rápidas, reservas, etc.)
   *   - /home/tab2: antipánico (mapa + botón)
   *   - /home/tab3: ingresos/listados futuros
   */
  {
    path: 'home',
    // canMatch: [OwnerGuard],
    loadComponent: () =>
      import('../tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then(m => m.Tab2Page)
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then(m => m.Tab3Page)
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full'
      }
    ]
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // ÁREA GUARDIAS (SECURITY) — Módulos del vigilador
  // TODO: cuando actives auth, descomentar canMatch: [SecurityGuard]
  // ───────────────────────────────────────────────────────────────────────────────
  /** Home de guardias (tabs/checkin/autoriza/checkout) */
  {
    path: 'guards/home',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/home/home.page').then(m => m.HomePage)
  },

  /** Listado/gestión de autorizaciones (guardias) */
  {
    path: 'guards/authorizations',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/authorizations/authorizations.page').then(m => m.AuthorizationsPage)
  },

  /** Vista combinada de check-in y check-out */
  {
    path: 'check-in-and-check-out',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/menu/registers/check-in-and-check-out/check-in-and-check-out.page').then(m => m.CheckInAndCheckOutPage)
  },

  /** Historial de eventos del guardia */
  {
    path: 'view-events',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/events/view-events/view-events.page').then(m => m.ViewEventsPage)
  },

  /** Pantalla de check-in */
  {
    path: 'checkin',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/checkin/checkin.page').then(m => m.CheckinPage)
  },

  /** Pantalla de check-out */
  {
    path: 'checkout',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guards/checkout/checkout.page').then(m => m.CheckoutPage)
  },

  /** Agenda de turnos/horarios de guardias */
  {
    path: 'guards-schedule',
    // canMatch: [SecurityGuard],
    loadComponent: () =>
      import('../pages/guardsSchedule/guards-schedule/guards-schedule.page').then(m => m.GuardsSchedulePage)
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // ÁREA ADMIN — Gestión de countries y dashboard
  // TODO: cuando actives auth, descomentar canMatch: [AdminGuard]
  // ───────────────────────────────────────────────────────────────────────────────
  /**
   * FLUJO ADMIN:
   * - /admin/home: listado de countries del admin + tarjeta “Añadir country”
   * - /admin/add-country: creación de country (form + mapa leaflet para polígono/perímetro)
   * - /admin/country-dashboard: (TEMPORAL) dashboard general
   *   👉 SUGERENCIA: migrar a /admin/country/:id/dashboard para abrir un país puntual.
   */

  /** Selector de countries del admin + CTA “Añadir country” */
  {
    path: 'admin/home',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/home/home.page').then(m => m.HomePage)
  },

  /** Alta de country (formulario + mapa con centro y 4 puntos de perímetro) */
  {
    path: 'admin/add-country',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/add-country/add-country.page').then(m => m.AddCountryPage)
  },

  /** Dashboard de administración (TEMPORAL sin :id) */
  {
  path: 'admin/country-dashboard/:id',
  //canMatch: [AdminGuard],
  loadComponent: () =>
    import('../pages/admin/country-dashboard/country-dashboard.page').then(m => m.CountryDashboardPage)
  },


  /** Amenities: alta */
  {
    path: 'admin/add-amenity',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-amenities/add-amenity/add-amenity.page').then(m => m.AddAmenityPage)
  },

  /** Amenities: listado */
  {
    path: 'admin/view-all-amenities',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-amenities/view-all/view-all.page').then(m => m.ViewAllPage)
  },

  /** Propietarios: alta */
  {
    path: 'admin/add-country-owner',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-owners/add-country-owner/add-country-owner.page').then(m => m.AddCountryOwnerPage)
  },

  /** Propietarios: asignar country a owner */
  {
    path: 'admin/assign-country-to-owner',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-owners/assign-country-to-owner/assign-country-to-owner.page').then(m => m.AssignCountryToOwnerPage)
  },

  /** Propietarios: ver listado */
  {
    path: 'admin/view-owners',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-owners/view/view.page').then(m => m.ViewPage)
  },

  /** Propiedades: alta */
  {
    path: 'admin/add-property',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-properties/add-property/add-property.page').then(m => m.AddPropertyPage)
  },

  /** Propiedades: ver listado */
  {
    path: 'admin/view-properties',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-properties/view/view.page').then(m => m.ViewPage)
  },

  /** Recurrentes: alta */
  {
    path: 'admin/add-recurrent',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/add-recurrent/add-recurrent.page').then(m => m.AddRecurrentPage)
  },

  /** Recurrentes: listado */
  {
    path: 'admin/country-recurrents',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/country-recurrents/country-recurrents.page').then(m => m.RecurrentsViewAllComponent)
  },

  /** Eventos: historial */
  {
    path: 'admin/events-historial',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/events-segment/events-historial/events-historial.page').then(m => m.EventsHistorialPage)
  },

  /** Guardias: alta */
  {
    path: 'admin/add-guard',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/add-guard/add-guard.page').then(m => m.AddGuardPage)
  },

  /** Guardias: agregar horario laboral */
  {
    path: 'admin/add-laboral-schedule',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/add-laboral-schedule/add-laboral-schedule.page').then(m => m.AddLaboralSchedulePage)
  },

  /** Guardias: listado */
  {
    path: 'admin/all-guards',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/all-guards/all-guards.page').then(m => m.AllGuardsPage)
  },

  /** Antipánico: historial */
  {
    path: 'admin/antipanic-historial',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/antipanic-historial/antipanic-historial.page').then(m => m.AntipanicHistorialPage)
  },

  /** Check-in/out: historial */
  {
    path: 'admin/checkin-out-historial',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/guard-segment/checkin-out-historial/checkin-out-historial.page').then(m => m.CheckinOutHistorialPage)
  },

  /** Solicitudes de reseteo de contraseña (admin) */
  {
    path: 'admin/password-requests',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/password-requests/password-requests/password-requests.page').then(m => m.PasswordRequestsPage)
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // Rutas comunes/extra (públicas o auxiliares de flujos existentes)
  // ───────────────────────────────────────────────────────────────────────────────

  /** (Legacy/aux) Ingresos (registrations) */
  {
    path: 'incomes',
    loadComponent: () =>
      import('../pages/registrations/incomes/incomes.page').then(m => m.IncomesPage)
  },

  /** (Legacy/aux) Autorizaciones de ingresos */
  {
    path: 'auth-incomes',
    loadComponent: () =>
      import('../pages/incomes/auth-incomes/auth-incomes.page').then(m => m.AuthIncomesPage)
  },

  /** (Legacy/aux) Nuevo ingreso */
  {
    path: 'new-income',
    loadComponent: () =>
      import('../pages/incomes/new-income/new-income.page').then(m => m.NewIncomePage)
  },

  /** (Legacy/aux) Reserva de evento/amenity */
  {
    path: 'event-reservation',
    loadComponent: () =>
      import('../pages/event-reservation/event-reservation.page').then(m => m.EventReservationPage)
  },

  /** (Legacy/aux) Descargas */
  {
    path: 'download',
    loadComponent: () =>
      import('../pages/download/download.page').then(m => m.DownloadPage)
  },

  /**
   * Admin → mapa de guardias (quedó sin prefijo 'admin' en los orígenes).
   * Mantengo ruta actual para no romper enlaces, pero ideal mover a /admin/map-guards.
   */
  {
    path: 'map-guards',
    // canMatch: [AdminGuard],
    loadComponent: () =>
      import('../pages/admin/map-guards/map-guards.page').then(m => m.MapGuardsPage)
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // Cuenta / Perfil
  // ───────────────────────────────────────────────────────────────────────────────

  /** Editar perfil */
  {
    path: 'account/edit',
    loadComponent: () =>
      import('../pages/account/edit/edit.page').then(m => m.EditPage)
  },

  /** Cambio de contraseña */
  {
    path: 'account/password-change',
    loadComponent: () =>
      import('../pages/account/password-change/password-change.page').then(m => m.PasswordChangePage)
  },

  /** Modal de edición de propietario por id */
  {
    path: 'edit-owner/:id',
    loadComponent: () =>
      import('../modals/owners/edit/edit.page').then(m => m.EditPage)
  },

  /** Demo/Playground */
  {
    path: 'explore-container',
    loadComponent: () =>
      import('../explore-container/explore-container.component').then(m => m.ExploreContainerComponent)
  },

  // ───────────────────────────────────────────────────────────────────────────────
  // Catch-all → vuelve a splash
  // ───────────────────────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'splash-screen'
  }
];
