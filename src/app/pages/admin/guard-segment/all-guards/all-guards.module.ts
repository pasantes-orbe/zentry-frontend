import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllGuardsPageRoutingModule } from './all-guards-routing.module';

import { AllGuardsPage } from './all-guards.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SortPipe } from 'src/app/pipes/sort.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllGuardsPageRoutingModule,
    ComponentsModule,
    Ng2SearchPipeModule
  ],
  declarations: [AllGuardsPage, SortPipe]
})
export class AllGuardsPageModule {}
