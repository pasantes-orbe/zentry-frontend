import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-politica-de-privacidad',
  templateUrl: './politica-de-privacidad.page.html',
  styleUrls: ['./politica-de-privacidad.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})

export class PoliticaDePrivacidadPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
