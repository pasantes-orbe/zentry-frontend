import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes/incomes.component';
import { IonicModule } from '@ionic/angular';
import { ReservationsComponent } from './reservations/reservations.component';
import { NavbarDefaultComponent } from './navbars/navbar-default/navbar-default.component';
import { NavbarBackComponent } from './navbars/navbar-back/navbar-back.component';
import { CountryMapComponent } from './maps/country-map/country-map.component';
import { LoaderComponent } from './loader/loader.component';
import { NavbarGuardsComponent } from './navbars/navbar-guards/navbar-guards.component';
import { IncomesGuardsComponent } from './incomes-guards/incomes-guards.component';
import { NavbarAdminComponent } from './navbars/navbar-admin/navbar-admin.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { RecurrentsViewAllComponent } from './recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';
import { SortPipe } from '../pipes/sort.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InvitationsComponent } from './invitations/invitations/invitations.component';



@NgModule({
  declarations: [
    SortPipe,
    NavbarAdminComponent, IncomesGuardsComponent, NavbarGuardsComponent, LoaderComponent, CountryMapComponent, IncomesComponent, ReservationsComponent, NavbarDefaultComponent, NavbarBackComponent, RecurrentsViewAllComponent, InvitationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    Ng2SearchPipeModule,
  ],
  providers: [SortPipe],
  exports: [NavbarAdminComponent, IncomesGuardsComponent, NavbarGuardsComponent, LoaderComponent, CountryMapComponent, IncomesComponent, ReservationsComponent, NavbarDefaultComponent, NavbarBackComponent, RecurrentsViewAllComponent, InvitationsComponent]
})
export class ComponentsModule { }
