import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CountryRecurrentsPage } from './country-recurrents.page';

const routes: Routes = [
  {
    path: '',
    component: CountryRecurrentsPage
  },
  {
    path: 'add-recurrent',
    loadChildren: () => import('./add-recurrent/add-recurrent.module').then( m => m.AddRecurrentPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CountryRecurrentsPageRoutingModule {}
