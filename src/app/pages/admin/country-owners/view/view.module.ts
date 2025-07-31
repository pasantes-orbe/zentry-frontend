import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewPageRoutingModule } from './view-routing.module';
import { ViewPage } from './view.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewPageRoutingModule,
    Ng2SearchPipeModule,
    // Se confirma que ComponentsModule (que exporta los pipes) está importado.
    ComponentsModule 
  ],
  // Se confirma que 'SortPipe' NO está en las declaraciones aquí.
  declarations: [ViewPage],
})
export class ViewPageModule {}
