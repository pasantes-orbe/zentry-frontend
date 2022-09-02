import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes/incomes.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [IncomesComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [IncomesComponent]
})
export class ComponentsModule { }
