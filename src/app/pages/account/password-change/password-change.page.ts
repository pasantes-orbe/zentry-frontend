import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

// Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.page.html',
  styleUrls: ['./password-change.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    NavbarBackComponent
  ]
})
export class PasswordChangePage implements OnInit {
  constructor() { }
  ngOnInit() {
  }

}
