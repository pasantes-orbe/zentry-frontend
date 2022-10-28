import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventReservationPage } from './event-reservation.page';

const routes: Routes = [
  {
    path: '',
    component: EventReservationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventReservationPageRoutingModule {}
