import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// Importar el pipe personalizado
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

// Interfaces
import { RecurrentsInterface } from 'src/app/interfaces/recurrents-interface';

// Servicios
import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';

@Component({
    selector: 'app-recurrents-view-all',
    templateUrl: './recurrents-view-all.component.html',
    styleUrls: ['./recurrents-view-all.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        IonicModule,
        FilterByPipe
    ]
})
export class RecurrentsViewAllComponent implements OnInit {

    @Input('role') role: string = '';
    @Input('readOnly') readOnly: boolean = false;

    public searchKey: string = '';
    public recurrents: RecurrentsInterface[] = [];

    constructor(
        private _recurrentsService: RecurrentsService,
        private _ownerStorage: OwnerStorageService
    ) { }

    async ngOnInit(): Promise<void> {
        try {
            if (this.role === 'owner') {
                const owner = await this._ownerStorage.getOwner();
                if (owner && owner.property && owner.property.id) {
                    const id_property = owner.property.id;
                    this._recurrentsService.getByPropertyID(id_property).subscribe(
                        recurrents => {
                            this.recurrents = recurrents;
                        }
                    );
                }
            } else {
                const recurrentsObservable = await this._recurrentsService.getRecurrentsByCountry();
                recurrentsObservable.subscribe(
                    recurrents => {
                        this.recurrents = recurrents;
                    }
                );
            }
        } catch (error) {
            console.error("Error en ngOnInit de RecurrentsViewAllComponent: ", error);
        }
    }

    public cambiarStatus(recurrent: RecurrentsInterface, i: number): void {
        if (recurrent && recurrent.id !== undefined && recurrent.status !== undefined) {
            this._recurrentsService.patchStatus(recurrent.id, !recurrent.status).subscribe(data => {
                this.recurrents[i].status = !this.recurrents[i].status;
            });
        }
    }
}