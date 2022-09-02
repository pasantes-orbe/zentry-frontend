import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecoverPasswordComponent } from './auth/recover-password/recover-password.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [RecoverPasswordComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [RecoverPasswordComponent]
})
export class ModalsModule { }
