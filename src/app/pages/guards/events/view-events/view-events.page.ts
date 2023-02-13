import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InvitationsComponent } from 'src/app/components/invitations/invitations/invitations.component';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.page.html',
  styleUrls: ['./view-events.page.scss'],
})
export class ViewEventsPage implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: InvitationsComponent,
      mode: 'ios',
      componentProps: {
        titulo: "hola" //TODO: Acá enviarle array de invitados
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

  }

}
