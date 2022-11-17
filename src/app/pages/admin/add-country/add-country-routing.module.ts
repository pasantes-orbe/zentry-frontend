import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddCountryPage } from './add-country.page';

const routes: Routes = [
  {
    path: '',
    component: AddCountryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddCountryPageRoutingModule {}
