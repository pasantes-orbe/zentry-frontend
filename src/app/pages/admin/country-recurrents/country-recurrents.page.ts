import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// Componentes
import { RecurrentsViewAllComponent } from 'src/app/components/recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-country-recurrents',
  templateUrl: './country-recurrents.page.html',
  styleUrls: ['./country-recurrents.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonicModule,
    RecurrentsViewAllComponent,
    NavbarAdminComponent
  ]
})
export class CountryRecurrentsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}