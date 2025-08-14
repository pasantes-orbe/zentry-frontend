import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.component.html',
    styleUrls: ['./invitations.component.scss'],
    standalone: true,
})
export class InvitationsComponent implements OnInit {

  // La propiedad 'guests' viene desde el componente que abre este modal.
  // Es una buena práctica inicializarla como un array vacío.
  @Input() guests: any[] = [];

  // CORRECCIÓN 1: Se declara la propiedad 'searchKey'.
  // Esta propiedad es necesaria para que el [(ngModel)] de la barra de búsqueda (ion-searchbar) funcione.
  public searchKey: string = '';

  // CORRECCIÓN 2: Se cambia 'private modalCtrl' a 'public modal'.
  // Al hacerlo público y llamarlo 'modal', la plantilla HTML ahora puede acceder
  // a sus métodos, como 'modal.dismiss()', que es lo que el error indicaba.
  constructor(public modal: ModalController) { }

  ngOnInit() {
    console.log(this.guests);
  }
  }