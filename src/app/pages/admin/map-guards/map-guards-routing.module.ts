import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapGuardsPage } from './map-guards.page';

const routes: Routes = [
  {
    path: '',
    component: MapGuardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapGuardsPageRoutingModule {}
