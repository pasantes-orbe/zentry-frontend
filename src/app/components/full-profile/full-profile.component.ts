import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonAvatar } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { OwnerResponse } from '../../interfaces/ownerResponse-interface';

@Component({
  selector: 'app-full-profile',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonAvatar],
  templateUrl: './full-profile.component.html',
  styleUrls: ['./full-profile.component.scss']
})
export class FullProfileComponent {
  @Input() owner?: OwnerResponse;
  @Input() editName: string = '';
  @Input() editEmail: string = '';
  @Input() editPhone: string = '';
  @Input() avatarUrl: string = '';

  constructor(private modalCtrl: ModalController) {}

  close() { this.modalCtrl.dismiss(); }

  getOwnerName(): string {
    const name = (this as any)?.owner?.user?.name ?? '';
    const lastname = (this as any)?.owner?.user?.lastname ?? '';
    const full = `${name} ${lastname}`.trim();
    if (full) return full;
    return this.editName || 'Propietario';
  }
}
