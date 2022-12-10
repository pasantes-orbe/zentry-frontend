import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssignCountryToOwnerPage } from './assign-country-to-owner.page';

const routes: Routes = [
  {
    path: '',
    component: AssignCountryToOwnerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignCountryToOwnerPageRoutingModule {}
