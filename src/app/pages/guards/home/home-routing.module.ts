import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { AuthorizationsPageModule } from '../authorizations/authorizations.module';

// const routes: Routes = [
//   {
//     path: '',
//     component: HomePage
//   }
// ];

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'checkin',
        loadChildren: () => import('../checkin/checkin.module').then(m => m.CheckinPageModule)
      },
      {
        path: 'autorizaciones',
        loadChildren: () => import('../authorizations/authorizations.module').then(m => m.AuthorizationsPageModule)
      },
      {
        path: 'checkout',
        loadChildren: () => import('../checkout/checkout.module').then(m => m.CheckoutPageModule)
      },
      {
        path: '',
        redirectTo: 'autorizaciones',
        pathMatch: 'full'
      }
      

    ]
  },
  {
    path: '',
    redirectTo: 'autorizaciones',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
