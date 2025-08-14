import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash-screen',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('../pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'splash-screen',
    loadComponent: () => import('../pages/splash-screen/splash-screen.page').then(m => m.SplashScreenPage)
  },
  {
    path: 'home',
    loadComponent: () => import('../tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'tab1',
        // CORRECCIÓN: La ruta correcta es ../tab1/tab1.page
        loadComponent: () => import('../tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: 'tab2',
        // CORRECCIÓN: La ruta correcta es ../tab2/tab2.module
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: 'tab3',
        // CORRECCIÓN: La ruta correcta es ../tab3/tab3.module
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: 'tab4',
        // CORRECCIÓN: La ruta correcta es ../tab1/tab1.page
        loadComponent: () => import('../tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: '',
        redirectTo: '/home/tab1',
        pathMatch: 'full'
      }
    ]
  },
  // ... resto de tus rutas ...
  {
    path: 'admin/home',
    loadChildren: () => import('../pages/admin/home/home.module').then(m => m.HomePageModule)
  },
  // ... etc.
];
