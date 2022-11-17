import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AntipanicHistorialPage } from './antipanic-historial.page';

const routes: Routes = [
  {
    path: '',
    component: AntipanicHistorialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AntipanicHistorialPageRoutingModule {}
