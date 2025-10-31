//src/app/components/navbars/navbar-guards/navbar-guards.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { MenuController } from '@ionic/angular';

// Interfaces
import { UserInterface } from 'src/app/interfaces/user-interface';

// Servicios
import { NavigationService } from 'src/app/helpers/navigation.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-navbar-guards',
    templateUrl: './navbar-guards.component.html',
    styleUrls: ['./navbar-guards.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonicModule
    ]
})
export class NavbarGuardsComponent implements OnInit {

    protected user: UserInterface;
    protected notifications: any[] = [];
    protected id_user: any;
    public countryName: string = "ZENTRY";
    public dropdownState: boolean = false;
    public unreadCount: number = 0;
    private wsSub?: Subscription;
    private refreshSub?: Subscription;

    constructor(
        public router: Router,
        protected _userStorage: UserStorageService,
        private menu: MenuController,
        private _socketService: WebSocketService,
        protected _countryStorage: CountryStorageService,
        private _notificationService: NotificationsService
    ) { }

    async ngOnInit() {
        const country = await this._countryStorage.getCountry();
        this.countryName = country.name;

        this.setUser(await this._userStorage.getUser());
        this.id_user = (await this._userStorage.getUser()).id;

        // Cargar notificaciones iniciales
        this.loadNotifications(this.id_user);

        // Suscribirse a nuevas notificaciones por WebSocket
        this.wsSub = this._socketService.newNotification$.subscribe((n: any) => {
            if (!n || typeof n !== 'object' || n.id_user == null || Number(n.id_user) === Number(this.id_user)) {
                this.loadNotifications(this.id_user);
            }
        });

        // Refrescar cuando se marquen como leídas
        this.refreshSub = this._notificationService.refresh$.subscribe(() => {
            this.loadNotifications(this.id_user);
        });
    }

    ionViewWillEnter() {
        // Implementar si es necesario
    }

    async signOut() {
        // SIMPLIFICAR PARA SOLO REDIRIGIR:
        this.router.navigate(['/login']);

        // COMENTAR TODO LO DEMÁS:
        /*
        const user = this.getUser();
        const timerID = await this._intervalStorageService.getInterval_id();

        await this._intervalStorageService.remove();
        window.clearInterval(timerID);
        this._socketService.disconnectGuardUbication(user.id);
        this._userStorage.signOut();
        this._countryStorage.signOut();
        if (Capacitor.getPlatform() == 'android') {
            this._pushService.removeOneSignalID();
        }
        */
    }

    protected navigate(url: string): void {
        this.router.navigate([url]);
    }

    protected openEnd(): void {
        this.menu.open('end');
    }

    protected openCustom(): void {
        this.menu.enable(true, 'custom');
        this.menu.open('custom');
    }

    protected openFirst(id: string): void {
        this.menu.enable(true, id);
        this.menu.open(id);
    }

    public getUser(): UserInterface {
        return this.user;
    }

    private setUser(user: UserInterface): void {
        this.user = user;
    }

    public dropdown() {
        this.dropdownState = !this.dropdownState;
    }

    public deleteNotification(noti: any, i: number) {
        console.log("Eliminado", noti, i);
        this.notifications.splice(i, 1);
    }

    public openNotification(notification: any) {
        // Cerrar el dropdown
        this.dropdownState = false;

        // Marcar como leída si no lo está
        if (!notification.read && notification.id) {
            this._notificationService.markAsRead([notification.id]).subscribe({
                next: () => {
                    notification.read = true;
                    this._notificationService.emitRefresh();
                },
                error: (err) => console.error('Error al marcar como leída:', err)
            });
        }

        // Navegar al evento si tiene reservation_id
        if (notification?.reservation_id) {
            this.router.navigate(['/view-events'], { 
                queryParams: { openReservationId: notification.reservation_id } 
            });
        }
    }

    public updateNotifications() {
        this.loadNotifications(this.id_user);
    }

    private loadNotifications(userId: number) {
        this._notificationService.getAllByUser(userId).subscribe({
            next: (res) => {
                const all = Array.isArray(res) ? res : [];
                // Mostrar solo las últimas 5 notificaciones
                this.notifications = all.slice(Math.max(all.length - 5, 0)).reverse();
                // Contar no leídas
                this.unreadCount = all.filter((n: any) => !n.read && !n.is_read).length;
            },
            error: (err) => {
                console.error('Error al cargar notificaciones:', err);
                this.notifications = [];
                this.unreadCount = 0;
            }
        });
    }

    ngOnDestroy() {
        if (this.wsSub) this.wsSub.unsubscribe();
        if (this.refreshSub) this.refreshSub.unsubscribe();
    }
}