import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthIncomesPage } from './auth-incomes.page';

const routes: Routes = [
  {
    path: '',
    component: AuthIncomesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthIncomesPageRoutingModule {}
