// src/app/modals/guards/edit-guard/edit-guard.module.ts

import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module'; // <-- Importamos SharedModule
import { ComponentsModule } from 'src/app/components/components.module';
import { EditGuardPageRoutingModule } from './edit-guard-routing.module';
import { EditGuardPage } from './edit-guard.page';

@NgModule({
  imports: [
    // SharedModule nos da acceso a CommonModule, FormsModule, ReactiveFormsModule e IonicModule.
    SharedModule,
    ComponentsModule,
    EditGuardPageRoutingModule
  ],
  declarations: [EditGuardPage]
})
export class EditGuardPageModule {}