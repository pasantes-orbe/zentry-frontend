import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPropertyPageRoutingModule } from './add-property-routing.module';

import { AddPropertyPage } from './add-property.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
    declarations: [AddPropertyPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddPropertyPageRoutingModule,
        ComponentsModule,
        ReactiveFormsModule,
    ]
})
export class AddPropertyPageModule {}
