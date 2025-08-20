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
  // Manejo de rutas no encontradas
  {
    path: '**',
    redirectTo: 'splash-screen'
  }
];