import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewPageRoutingModule } from './view-routing.module';
import { ViewPage } from './view.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewPageRoutingModule,
    ComponentsModule
  ],
  // Se confirma que 'SortPipe' NO está en las declaraciones aquí.
  declarations: [ViewPage],
})
export class ViewPageModule {}
