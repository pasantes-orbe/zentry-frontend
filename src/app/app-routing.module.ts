import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
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
  }




];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
