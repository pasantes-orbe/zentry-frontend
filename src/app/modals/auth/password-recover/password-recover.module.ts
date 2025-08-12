import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module'; // <-- Importamos SharedModule
import { PasswordRecoverPageRoutingModule } from './password-recover-routing.module';
import { PasswordRecoverPage } from './password-recover.page';

@NgModule({
  imports: [
    // SharedModule nos da acceso a todo lo que necesitamos (CommonModule, FormsModule, etc.)
    SharedModule,
    PasswordRecoverPageRoutingModule
  ],
  declarations: [PasswordRecoverPage]
})
export class PasswordRecoverPageModule {}