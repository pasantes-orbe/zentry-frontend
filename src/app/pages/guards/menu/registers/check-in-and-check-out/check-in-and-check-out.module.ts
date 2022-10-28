import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckInAndCheckOutPageRoutingModule } from './check-in-and-check-out-routing.module';

import { CheckInAndCheckOutPage } from './check-in-and-check-out.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Ng2SearchPipeModule,
    CheckInAndCheckOutPageRoutingModule,
    ComponentsModule,
    
  ],
  declarations: [CheckInAndCheckOutPage]
})
export class CheckInAndCheckOutPageModule {}
