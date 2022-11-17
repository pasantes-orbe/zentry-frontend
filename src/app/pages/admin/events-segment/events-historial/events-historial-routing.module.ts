import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsHistorialPage } from './events-historial.page';

const routes: Routes = [
  {
    path: '',
    component: EventsHistorialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsHistorialPageRoutingModule {}
