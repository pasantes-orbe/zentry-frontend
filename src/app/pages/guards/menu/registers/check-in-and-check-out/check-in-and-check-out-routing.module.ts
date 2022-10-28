import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckInAndCheckOutPage } from './check-in-and-check-out.page';

const routes: Routes = [
  {
    path: '',
    component: CheckInAndCheckOutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckInAndCheckOutPageRoutingModule {}
