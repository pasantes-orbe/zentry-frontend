import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoliticaDePrivacidadPageRoutingModule } from './politica-de-privacidad-routing.module';

import { PoliticaDePrivacidadPage } from './politica-de-privacidad.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoliticaDePrivacidadPageRoutingModule
  ],
  declarations: [PoliticaDePrivacidadPage]
})
export class PoliticaDePrivacidadPageModule {}
