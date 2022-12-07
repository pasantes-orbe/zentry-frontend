import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddAmenityPageRoutingModule } from './add-amenity-routing.module';

import { AddAmenityPage } from './add-amenity.page';
import { ComponentsModule } from "../../../../components/components.module";

@NgModule({
    declarations: [AddAmenityPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddAmenityPageRoutingModule,
        ComponentsModule,
        ReactiveFormsModule
    ]
})
export class AddAmenityPageModule {}
