import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecoverPasswordComponent } from './auth/recover-password/recover-password.component';



@NgModule({
  declarations: [RecoverPasswordComponent],
  imports: [
    CommonModule,
  ],
  exports: [RecoverPasswordComponent]
})
export class ModalsModule { }
