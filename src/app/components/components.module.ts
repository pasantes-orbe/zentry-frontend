// src/app/components/components.module.ts

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module'; // <-- Importamos nuestra caja de herramientas

// Pipes
import { FilterByPipe } from '../pipes/filter-by.pipe';
import { SortPipe } from '../pipes/sort.pipe';

// Todos tus componentes
import { IncomesComponent } from './incomes/incomes.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { NavbarDefaultComponent } from './navbars/navbar-default/navbar-default.component';
import { NavbarBackComponent } from './navbars/navbar-back/navbar-back.component';
import { CountryMapComponent } from './maps/country-map/country-map.component';
import { LoaderComponent } from './loader/loader.component';
import { NavbarGuardsComponent } from './navbars/navbar-guards/navbar-guards.component';
import { IncomesGuardsComponent } from './incomes-guards/incomes-guards.component';
import { NavbarAdminComponent } from './navbars/navbar-admin/navbar-admin.component';
import { RecurrentsViewAllComponent } from './recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';
import { InvitationsComponent } from './invitations/invitations/invitations.component';
import { CountryPopoverComponent } from './country-popover/country-popover.component';

@NgModule({
    imports: [
        SharedModule,
        FilterByPipe,
        SortPipe,
        IncomesComponent,
        ReservationsComponent,
        NavbarDefaultComponent,
        NavbarBackComponent,
        CountryMapComponent,
        LoaderComponent,
        NavbarGuardsComponent,
        IncomesGuardsComponent,
        NavbarAdminComponent,
        RecurrentsViewAllComponent,
        InvitationsComponent,
        CountryPopoverComponent,
    ],
    exports: [
        FilterByPipe,
        SortPipe,
        IncomesComponent,
        ReservationsComponent,
        NavbarDefaultComponent,
        NavbarBackComponent,
        CountryMapComponent,
        LoaderComponent,
        NavbarGuardsComponent,
        IncomesGuardsComponent,
        NavbarAdminComponent,
        RecurrentsViewAllComponent,
        InvitationsComponent,
        CountryPopoverComponent
    ]
})
export class ComponentsModule { }
