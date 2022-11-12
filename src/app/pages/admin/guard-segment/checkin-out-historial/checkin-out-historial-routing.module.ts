import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckinOutHistorialPage } from './checkin-out-historial.page';

const routes: Routes = [
  {
    path: '',
    component: CheckinOutHistorialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckinOutHistorialPageRoutingModule {}
