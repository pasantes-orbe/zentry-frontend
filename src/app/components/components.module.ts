import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes/incomes.component';



@NgModule({
  declarations: [IncomesComponent],
  imports: [
    CommonModule
  ],
  exports: [IncomesComponent]
})
export class ComponentsModule { }
