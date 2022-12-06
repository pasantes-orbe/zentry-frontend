import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddPropertyPage } from './add-property.page';

const routes: Routes = [
  {
    path: '',
    component: AddPropertyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPropertyPageRoutingModule {}
