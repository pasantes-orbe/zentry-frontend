import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecoverPasswordComponent } from './auth/recover-password/recover-password.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [RecoverPasswordComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [RecoverPasswordComponent]
})
export class ModalsModule { }
