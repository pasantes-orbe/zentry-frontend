import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
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
