import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddCountryOwnerPage } from './add-country-owner.page';

const routes: Routes = [
  {
    path: '',
    component: AddCountryOwnerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddCountryOwnerPageRoutingModule {}
