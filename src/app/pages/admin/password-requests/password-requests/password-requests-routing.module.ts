import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordRequestsPage } from './password-requests.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordRequestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordRequestsPageRoutingModule {}
