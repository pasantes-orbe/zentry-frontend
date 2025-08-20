import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

// Interfaces
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { UserInterface } from '../interfaces/user-interface';

// Socket
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { AlertService } from '../services/helpers/alert.service';

// Componentes
import { NavbarDefaultComponent } from '../components/navbars/navbar-default/navbar-default.component';
import { IncomesComponent } from '../components/incomes/incomes.component';

@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonicModule,
        RouterModule,
        NavbarDefaultComponent,
        IncomesComponent
    ]
})
export class Tab3Page implements OnInit {
    private user: UserInterface;
    private userID: string;
    protected owner: OwnerResponse;
    private socket: Socket;
    public recurrentsState = false;

    @ViewChild('incomesComponent') incomesComponent: IncomesComponent;

    constructor(
        private _userStorageService: UserStorageService,
        private _ownersService: OwnersService,
        private _ownerStorageService: OwnerStorageService,
        private alerts: AlertService
    ) {
        this.socket = io(environment.URL);
    }

    async ngOnInit() {
        const user = await this._userStorageService.getUser();
        if (user) {
            this.userID = String(user.id);
            this._ownersService.getByID(this.userID).subscribe((owner) => {
                this.owner = owner;
                this._ownerStorageService.saveOwner(owner);
            });
            this.nuevoPropietarioConectado();
            this.escucharNotificacionesCheckin();
        }
    }

    ionViewWillEnter() {
        if (this.incomesComponent) {
            this.incomesComponent.ngOnInit();
        }
    }

    async escucharNotificacionesCheckin() {
        this.socket.on('notificacion-check-in', async (payload) => {
            console.log(payload);
            await this.alerts.presentAlert(payload);
            if (this.incomesComponent) {
                this.incomesComponent.ngOnInit();
            }
        });
    }

    async nuevoPropietarioConectado() {
        this.socket.emit('owner-connected', this.userID);
    }

    viewRecurrents() {
        this.recurrentsState = !this.recurrentsState;
    }
}