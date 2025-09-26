import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

import { RecurrentsInterface } from 'src/app/interfaces/recurrents-interface';
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

@Component({
  selector: 'app-recurrents-view-all',
  templateUrl: './country-recurrents.page.html',
  styleUrls: ['./country-recurrents.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule, NavbarBackComponent]
})
export class RecurrentsViewAllComponent implements OnInit {
  @Input() role: 'admin' | 'owner' | '' = '';
  @Input() readOnly: boolean = false;

  public searchKey = '';
  public loading = true;
  public recurrents: RecurrentsInterface[] = [];

  // ← público para usar en el template (routerLink canónico)
  public countryIdFromUrl?: number;

  constructor(
    private route: ActivatedRoute,
    private recurrentsSvc: RecurrentsService,
    private ownerStorage: OwnerStorageService,
    private countryStorage: CountryStorageService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    // 1) param :id (ruta canónica /admin/country/:id/recurrents)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) this.countryIdFromUrl = Number(idParam);

    // 2) query params (fallback)
    const qp = this.route.snapshot.queryParamMap;
    const roleParam = qp.get('role');
    const cidParam = qp.get('countryId');

    if (roleParam) this.role = roleParam as any;
    if (!this.countryIdFromUrl && cidParam) this.countryIdFromUrl = Number(cidParam);

    await this.loadDataSafe();
  }

  private async loadDataSafe(): Promise<void> {
    try {
      if (this.role === 'owner') {
        const owner = await this.ownerStorage.getOwner().catch(() => null);
        const propId = owner?.property?.id;
        if (!propId) {
          this.recurrents = [];
          this.loading = false;
          return this.toast('No se encontró la propiedad del propietario.');
        }
        this.recurrentsSvc.getByPropertyID(propId).subscribe({
          next: (list) => { this.recurrents = list ?? []; this.loading = false; },
          error: async (err) => { console.error(err); this.recurrents = []; this.loading = false; await this.toast('Error obteniendo recurrentes.'); }
        });
      } else {
        // admin / guard
        let cid = this.countryIdFromUrl;
        if (!cid) {
          const stored = await this.countryStorage.getCountry().catch(() => null);
          cid = stored?.id;
        }
        if (!cid) {
          this.recurrents = [];
          this.loading = false;
          return this.toast('No hay country seleccionado. Volvé al dashboard.');
        }
        this.recurrentsSvc.getRecurrentsByCountryId(cid).subscribe({
          next: (list) => { this.recurrents = list ?? []; this.loading = false; },
          error: async (err) => { console.error(err); this.recurrents = []; this.loading = false; await this.toast('Error obteniendo recurrentes.'); }
        });
      }
    } catch (e) {
      console.error('loadDataSafe error:', e);
      this.recurrents = [];
      this.loading = false;
      await this.toast('Ocurrió un error al cargar los invitados recurrentes.');
    }
  }

  public cambiarStatus(recurrent: RecurrentsInterface, i: number): void {
    if (!recurrent || recurrent.id == null) return;
    const newStatus = !recurrent.status;
    this.recurrentsSvc.patchStatus(recurrent.id, newStatus).subscribe({
      next: () => { if (this.recurrents[i]) this.recurrents[i].status = newStatus; },
      error: (err) => console.error('patchStatus error', err)
    });
  }

  // ← NUEVO: eliminar (hard delete). Si preferís soft, usá patchStatus(id,false)
  public eliminar(recurrent: RecurrentsInterface, i: number): void {
    if (!recurrent?.id) return;
    this.recurrentsSvc.deleteRecurrent(Number(recurrent.id)).subscribe({
      next: () => { this.recurrents.splice(i, 1); },
      error: (err) => console.error('deleteRecurrent error', err)
    });
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
