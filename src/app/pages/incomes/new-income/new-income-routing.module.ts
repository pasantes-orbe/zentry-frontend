import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewIncomePage } from './new-income.page';

const routes: Routes = [
  {
    path: '',
    component: NewIncomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewIncomePageRoutingModule {}
