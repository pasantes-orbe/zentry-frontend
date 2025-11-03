import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';
import { PendingCheckinsComponent } from 'src/app/components/pending-checkins/pending-checkins.component';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';

@Component({
  selector: 'app-pending-checkins-page',
  templateUrl: './pending-checkins.page.html',
  styleUrls: ['./pending-checkins.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NavbarBackComponent,
    PendingCheckinsComponent
  ]
})
export class PendingCheckinsPage implements OnInit {

  @ViewChild(PendingCheckinsComponent) pendingCheckinsComponent!: PendingCheckinsComponent;

  public ownerId: number | null = null;

  constructor(
    private ownerStorage: OwnerStorageService
  ) {}

  async ngOnInit() {
    await this.loadOwner();
  }

  async ionViewWillEnter() {
    // Recargar cuando se vuelve a la página
    await this.loadOwner();
    if (this.pendingCheckinsComponent) {
      this.pendingCheckinsComponent.reload();
    }
  }

  private async loadOwner() {
    try {
      const owner = await this.ownerStorage.getOwner();
      if (owner?.user?.id) {
        this.ownerId = owner.user.id;
        console.log('[PendingCheckinsPage] Owner ID:', this.ownerId);
      } else {
        console.error('[PendingCheckinsPage] No se pudo obtener el owner');
      }
    } catch (error) {
      console.error('[PendingCheckinsPage] Error al cargar owner:', error);
    }
  }
}
