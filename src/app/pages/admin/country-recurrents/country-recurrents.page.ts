import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

// Componentes de Ionic
import { IonList, IonItem, IonLabel, IonToggle, IonSearchbar } from '@ionic/angular/standalone';

// Servicios
import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';

//Interface
import { RecurrentsInterface } from 'src/app/interfaces/recurrents-interface';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-recurrents-view-all',
  templateUrl: './country-recurrents.page.html',
  styleUrls: ['country-recurrents.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // Para *ngIf y *ngFor
    IonicModule,
    FormsModule,
    NavbarBackComponent
  ]
})
export class RecurrentsViewAllComponent implements OnInit {

  @Input('role') role: string = '';
  @Input('readOnly') readOnly: boolean = false;

  public searchKey: string = '';
  recurrents: RecurrentsInterface[] = [];

  constructor(
    private _recurrentsService: RecurrentsService,
    private _ownerStorage: OwnerStorageService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      if (this.role === 'owner') {
        const owner = await this._ownerStorage.getOwner();
        const hasPropertyId =
          owner?.property?.id !== undefined && owner.property.id !== null;

        if (owner && hasPropertyId) {
          const id_property = owner!.property!.id;
          this._recurrentsService.getByPropertyID(id_property).subscribe({
            next: (recurrents) => {
              this.recurrents = recurrents ?? [];
            },
            error: (err) => {
              console.error('Error al obtener recurrents por propiedad', err);
            }
          });
        } else {
          // Opcional: manejo cuando no hay propiedad
          this.recurrents = [];
        }
      } else {
        // Caso país/global
        const recurrentsObservable = await this._recurrentsService.getRecurrentsByCountry();
        recurrentsObservable.subscribe({
          next: (recurrents) => {
            this.recurrents = recurrents ?? [];
          },
          error: (err) => {
            console.error('Error al obtener recurrents por país', err);
          }
        });
      }
    } catch (error) {
      console.error('Error en ngOnInit de RecurrentsViewAllComponent: ', error);
    }
  }

  public cambiarStatus(recurrent: RecurrentsInterface, i: number): void {
    if (
      recurrent &&
      recurrent.id !== undefined &&
      recurrent.status !== undefined
    ) {
      this._recurrentsService.patchStatus(recurrent.id, !recurrent.status).subscribe({
        next: () => {
          // Actualizar estado local de forma segura
          if (this.recurrents && this.recurrents[i]) {
            this.recurrents[i].status = !this.recurrents[i].status;
          }
        },
        error: (err) => {
          console.error('Error al cambiar estado del recurrente', err);
        }
      });
    }
  }
}