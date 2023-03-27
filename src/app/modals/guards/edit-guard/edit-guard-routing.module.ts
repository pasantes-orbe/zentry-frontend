import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditGuardPage } from './edit-guard.page';

const routes: Routes = [
  {
    path: '',
    component: EditGuardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditGuardPageRoutingModule {}
