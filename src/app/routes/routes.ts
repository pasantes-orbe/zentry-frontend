import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash-screen',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'splash-screen',
    loadComponent: () =>
      import('../pages/splash-screen/splash-screen.page').then(m => m.SplashScreenPage)
  },
  {
    path: 'incomes',
    loadComponent: () =>
      import('../pages/registrations/incomes/incomes.page').then(m => m.IncomesPage)
  },
  {
    path: 'politica-de-privacidad',
    loadComponent: () =>
      import('../pages/politica-de-privacidad/politica-de-privacidad.page').then(m => m.PoliticaDePrivacidadPage)
  },
  {
    path: 'auth-incomes',
    loadComponent: () =>
      import('../pages/incomes/auth-incomes/auth-incomes.page').then(m => m.AuthIncomesPage)
  },
  {
  path: 'new-income',
  loadComponent: () =>
    import('../pages/incomes/new-income/new-income.page').then(m => m.NewIncomePage)
  },
  {
  path: 'guards-schedule',
  loadComponent: () =>
    import('../pages/guardsSchedule/guards-schedule/guards-schedule.page').then(m => m.GuardsSchedulePage)
  },
  {
  path: 'guards/home',
  loadComponent: () =>
    import('../pages/guards/home/home.page').then(m => m.HomePage)
  },
  {
  path: 'view-events',
  loadComponent: () =>
    import('../pages/guards/events/view-events/view-events.page').then(m => m.ViewEventsPage)
  },
  {
  path: 'check-in-and-check-out',
  loadComponent: () => 
    import('../pages/guards/menu/registers/check-in-and-check-out/check-in-and-check-out.page').then(m => m.CheckInAndCheckOutPage)
  },
  {
    path: 'home',
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
  {
    path: 'admin/home',
    loadComponent: () =>
      import('../pages/admin/home/home.page').then(m => m.HomePage)
  },

  {
    path: '**',
    redirectTo: 'splash-screen'
  }
];