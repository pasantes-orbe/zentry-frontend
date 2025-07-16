import { Component, Input, OnInit } from '@angular/core';
import { RecurrentsInterface } from 'src/app/interfaces/recurrents-interface';
import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';

@Component({
  selector: 'app-recurrents-view-all',
  templateUrl: './recurrents-view-all.component.html',
  styleUrls: ['./recurrents-view-all.component.scss'],
  // providers: [SortPipe] // Se elimina 'providers'. Los Pipes deben declararse en un NgModule.
})
export class RecurrentsViewAllComponent implements OnInit {

  @Input('role') role: string = '';
  @Input('readOnly') readOnly: boolean = false;

  // CORRECCIÓN 1: Se declara la propiedad 'searchKey' y se inicializa.
  // Esta propiedad es necesaria para que el [(ngModel)] de la barra de búsqueda funcione.
  public searchKey: string = '';

  // Se inicializa el array para evitar errores de 'undefined' y se le da un tipo.
  recurrents: RecurrentsInterface[] = [];

  constructor(
    private _recurrentsService: RecurrentsService,
    private _ownerStorage: OwnerStorageService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      if (this.role === 'owner') {
        const owner = await this._ownerStorage.getOwner();
        // Se añade una comprobación para asegurar que 'owner' y 'property' existen.
        if (owner && owner.property && owner.property.id) {
          const id_property = owner.property.id;
          this._recurrentsService.getByPropertyID(id_property).subscribe(
            recurrents => {
              this.recurrents = recurrents;
              console.log("DESDE EL OWNER");
            }
          );
        }
      } else {
        // La sintaxis (await promise).subscribe() es inusual, pero se mantiene la lógica original.
        const recurrentsObservable = await this._recurrentsService.getRecurrentsByCountry();
        recurrentsObservable.subscribe(
          recurrents => {
            this.recurrents = recurrents;
            console.log(recurrents);
          }
        );
      }
    } catch (error) {
      console.error("Error en ngOnInit de RecurrentsViewAllComponent: ", error);
    }

    console.log(this.role);
    console.log(this.readOnly);
  }

  public cambiarStatus(recurrent: RecurrentsInterface, i: number): void {
    // Se añade una comprobación para asegurar que el objeto recurrente es válido.
    if (recurrent && recurrent.id !== undefined && recurrent.status !== undefined) {
      this._recurrentsService.patchStatus(recurrent.id, !recurrent.status).subscribe(data => {
        console.log(data);
        // Es mejor práctica actualizar el dato desde la respuesta del servidor,
        // pero esto funciona para alternar el estado en la UI.
        this.recurrents[i].status = !this.recurrents[i].status;
      });
    }
  }
}
