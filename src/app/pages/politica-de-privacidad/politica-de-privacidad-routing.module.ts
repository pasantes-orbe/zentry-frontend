import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PoliticaDePrivacidadPage } from './politica-de-privacidad.page';

const routes: Routes = [
  {
    path: '',
    component: PoliticaDePrivacidadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PoliticaDePrivacidadPageRoutingModule {}
