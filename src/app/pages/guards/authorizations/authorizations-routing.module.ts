import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthorizationsPage } from './authorizations.page';

const routes: Routes = [
  {
    path: '',
    component: AuthorizationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthorizationsPageRoutingModule {}
