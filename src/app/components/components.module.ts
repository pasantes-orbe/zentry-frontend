import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes/incomes.component';
import { IonicModule } from '@ionic/angular';
import { ReservationsComponent } from './reservations/reservations.component';



@NgModule({
  declarations: [IncomesComponent, ReservationsComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [IncomesComponent, ReservationsComponent]
})
export class ComponentsModule { }
