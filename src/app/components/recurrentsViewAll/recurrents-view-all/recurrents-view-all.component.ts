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
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

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
        private _ownerStorage: OwnerStorageService,
        private _countryStorage: CountryStorageService
    ) { }

    async ngOnInit(): Promise<void> {
        console.log('[RecurrentsViewAll] ngOnInit - role:', this.role, 'readOnly:', this.readOnly);
        
        try {
            if (this.role === 'owner') {
                console.log('[RecurrentsViewAll] Loading recurrents for OWNER');
                const owner = await this._ownerStorage.getOwner();
                console.log('[RecurrentsViewAll] Owner from storage:', owner);
                
                if (owner && owner.property && owner.property.id) {
                    const id_property = owner.property.id;
                    console.log('[RecurrentsViewAll] Property ID:', id_property);
                    
                    this._recurrentsService.getByPropertyID(id_property).subscribe(
                        recurrents => {
                            console.log('[RecurrentsViewAll] Recurrents loaded for owner:', recurrents);
                            this.recurrents = recurrents || [];
                        },
                        error => {
                            console.error('[RecurrentsViewAll] Error loading recurrents for owner:', error);
                            this.recurrents = [];
                        }
                    );
                } else {
                    console.warn('[RecurrentsViewAll] Owner or property not found');
                    this.recurrents = [];
                }
            } else {
                // Para guard o admin: usar country
                console.log('[RecurrentsViewAll] Loading recurrents for GUARD/ADMIN by country');
                const country = await this._countryStorage.getCountry();
                console.log('[RecurrentsViewAll] Country from storage:', country);
                
                if (country && country.id) {
                    console.log('[RecurrentsViewAll] Country ID:', country.id);
                    
                    this._recurrentsService.getRecurrentsByCountryId(country.id).subscribe(
                        recurrents => {
                            console.log('[RecurrentsViewAll] Recurrents loaded for guard:', recurrents);
                            this.recurrents = recurrents || [];
                        },
                        error => {
                            console.error('[RecurrentsViewAll] Error loading recurrents for guard:', error);
                            this.recurrents = [];
                        }
                    );
                } else {
                    console.warn('[RecurrentsViewAll] Country not found in storage');
                    this.recurrents = [];
                }
            }
        } catch (error) {
            console.error('[RecurrentsViewAll] Error en ngOnInit:', error);
            this.recurrents = [];
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