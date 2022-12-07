import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCountryOwnerPageRoutingModule } from './add-country-owner-routing.module';

import { AddCountryOwnerPage } from './add-country-owner.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
    declarations: [AddCountryOwnerPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddCountryOwnerPageRoutingModule,
        ComponentsModule,
        ReactiveFormsModule,
    ]
})
export class AddCountryOwnerPageModule {}
