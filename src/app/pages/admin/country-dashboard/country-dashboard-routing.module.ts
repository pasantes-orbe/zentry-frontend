import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CountryDashboardPage } from './country-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: CountryDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CountryDashboardPageRoutingModule {}
