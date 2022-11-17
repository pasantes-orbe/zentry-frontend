import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CountryRecurrentsPage } from './country-recurrents.page';

const routes: Routes = [
  {
    path: '',
    component: CountryRecurrentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CountryRecurrentsPageRoutingModule {}
