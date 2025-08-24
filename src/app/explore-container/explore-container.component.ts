import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

//Componentes
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    IonSpinner
  ],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;

  constructor() { }
  ngOnInit() { }
}
