import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddGuardPage } from './add-guard.page';

const routes: Routes = [
  {
    path: '',
    component: AddGuardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddGuardPageRoutingModule {}
