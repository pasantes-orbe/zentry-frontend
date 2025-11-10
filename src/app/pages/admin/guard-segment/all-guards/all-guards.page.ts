//src/app/pages/admin/guard-segment/all-guards/all-guards.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

//Servicios
import { GuardsService } from '../../../../services/guards/guards.service';
import { UserService } from 'src/app/services/user/user.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

//Interfaces
import { GuardInterface } from '../../../../interfaces/guard-interface';

// Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";
import { EditGuardPage } from 'src/app/modals/guards/edit-guard/edit-guard.page';

// Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

// Interface para mock data
interface MockGuard {
  id: number;
  guard: {
    user: {
      id: number;
      name: string;
      lastname: string;
      dni: string;
      email: string;
      phone: string;
      avatar: string;
      isActive: boolean;
    }
  };
  working: boolean;
  schedules: Array<{
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    working: boolean;
  }>;
}

@Component({
  selector: 'app-all-guards',
  templateUrl: './all-guards.page.html',
  styleUrls: ['./all-guards.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class AllGuardsPage implements OnInit {

  public guards: any[] = [];
  public guardsOut: any[] = [];
  public dropdownState: boolean = false;
  public message = 'This modal example uses the modalController to present and dismiss modals.';
  public searchKey: string = '';
  public searchKey1: string = '';
  private countryId: string | null = null;
  
  // Set de IDs de guardias activos (enviando ubicación)
  private activeGuardIds = new Set<number>();

  constructor(
    private _guardsService: GuardsService,
    private modalCtrl: ModalController,
    private _userService: UserService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private socketSvc: WebSocketService
  ) { }

  async ngOnInit() {
    // Conectar WebSocket
    await this.socketSvc.conectar();
    
    // Escuchar guardias activos
    this.socketSvc.escucharEvento('get-actives-guards', (activeGuards: any[]) => {
      console.log('[AllGuards] Guardias activos recibidos:', activeGuards);
      this.activeGuardIds.clear();
      activeGuards.forEach((g: any) => this.activeGuardIds.add(Number(g.id_user)));
    });
    
    this.route.queryParams.subscribe(params => {
      this.countryId = params['countryId'];
      if (this.countryId) {
        this.loadGuards();
      } else {
        console.error("No se encontró el countryId en los parámetros de la URL.");
      }
    });
  }

  ionViewWillEnter() {
    if (this.countryId) {
      this.loadGuards();
    }
  }

  loadGuards() {
    try {
      if (!this.countryId) {
        console.warn("loadGuards llamado sin countryId. No se puede consultar la API.");
        return;
      }

      this._guardsService.getAllByCountryID(this.countryId).subscribe({
        next: (rawGuards: any[]) => {
          console.log('=== DEBUG: Respuesta completa del backend ===');
          console.log('rawGuards:', rawGuards);
          
          if (!Array.isArray(rawGuards)) {
            console.error("La API no devolvió un array válido de horarios de vigiladores.");
            this.guards = [];
            this.guardsOut = [];
            return; 
          }

          const activeGuards = rawGuards.filter(guard => guard.guard?.user?.isActive !== false);
          
          console.log('=== DEBUG: Después del filtro de activos ===');
          console.log('activeGuards:', activeGuards);
          console.log('Cantidad de guardias activos:', activeGuards.length);
          
          const guardsGroupedByUser = this.groupGuardsByUser(activeGuards);
          
          console.log('=== DEBUG: Después de agrupar ===');
          console.log('guardsGroupedByUser:', guardsGroupedByUser);
          
          const { working, notWorking } = this.separateWorkingGuards(guardsGroupedByUser);

          this.guards = working;
          this.guardsOut = notWorking;

          console.log('=== DEBUG: Resultado final ===');
          console.log('Guardias trabajando:', this.guards);
          console.log('Guardias fuera de servicio:', this.guardsOut);
        },
        error: (err) => {
          console.error("Error al obtener los guardias de la API:", err);
        }
      });
    } catch (error) {
      console.error("Error al cargar los guardias:", error);
    }
  }

  private groupGuardsByUser(guards: any[]): any[] {
    const userGuardMap = {};
    for (const guardSchedule of guards) {
      const userData = guardSchedule.guard?.user;
      if (!userData) {
        console.warn("Elemento de horario sin datos de usuario anidados. Saltando:", guardSchedule);
        continue;
      }
      
      const userId = userData.id;

      if (!userGuardMap[userId]) {
        userGuardMap[userId] = {
          id: userId,
          guard: { user: userData }, 
          schedules: [],
        };
      }
      userGuardMap[userId].schedules.push(guardSchedule);
    }
    return Object.values(userGuardMap);
  }

  private separateWorkingGuards(groupedGuards: any[]) {
    const working = [];
    const notWorking = [];

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    console.log('=== DEBUG: Verificando horarios ===');
    console.log('Día actual:', currentDay, '(0=Dom, 1=Lun, ..., 6=Sáb)');
    console.log('Hora actual:', `${now.getHours()}:${now.getMinutes()}`, `(${currentTime} minutos)`);

    for (const userGroup of groupedGuards) {
      const hasSchedules = userGroup.schedules && userGroup.schedules.length > 0;
      
      console.log(`\n--- Evaluando: ${userGroup.guard.user.name} ---`);
      console.log('Tiene horarios?', hasSchedules);
      
      if (!hasSchedules) {
        notWorking.push(userGroup);
        continue;
      }

      const isWorkingNow = userGroup.schedules.some(schedule => {
        const guardData = schedule.guard;
        const scheduleDay = parseInt(guardData.week_day);
        const scheduleDayJS = scheduleDay === 7 ? 0 : scheduleDay;

        if (scheduleDayJS !== currentDay) {
          return false;
        }

        const startTime = this.parseTimeToMinutes(guardData.start);
        const endTime = this.parseTimeToMinutes(guardData.exit);

        console.log(`  Día ${scheduleDay}, ${guardData.start} - ${guardData.exit} (${startTime}-${endTime} min)`);

        if (endTime < startTime) {
          const isInRange = currentTime >= startTime || currentTime <= endTime;
          console.log(`  Cruza medianoche: ${isInRange ? '✅' : '❌'}`);
          return isInRange;
        } else {
          const isInRange = currentTime >= startTime && currentTime <= endTime;
          console.log(`  Horario normal: ${isInRange ? '✅' : '❌'}`);
          return isInRange;
        }
      });

      if (isWorkingNow) {
        console.log(`  ✅ ${userGroup.guard.user.name} está trabajando AHORA`);
        working.push(userGroup);
      } else {
        console.log(`  ❌ ${userGroup.guard.user.name} NO está trabajando ahora`);
        notWorking.push(userGroup);
      }
    }
    return { working, notWorking };
  }

  private parseTimeToMinutes(timeString: string): number {
    if (!timeString) return 0;
    
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return hours * 60 + minutes;
    }
    
    let timePart = timeString;
    if (timeString.includes(' ')) {
      timePart = timeString.split(' ')[1];
    }
    
    const parts = timePart.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    return hours * 60 + minutes;
  }

  handleRefresh(event) {
    setTimeout(() => {
      this.loadGuards();
      event.target.complete();
    }, 2000);
  }

  // ==========================================
  // MÉTODO deleteGuard COMENTADO (YA NO SE USA)
  // Ahora usamos toggleGuardStatus para activar/desactivar
  // ==========================================
  /*
  async deleteGuard(userId: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Estás seguro?',
      message: 'El guardia será eliminado permanentemente.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          cssClass: 'red',
          handler: () => {
            this._userService.deleteUserById(userId).subscribe({
              next: res => {
                console.log('Guardia eliminado exitosamente:', res);
                this.loadGuards(); 
              },
              error: err => {
                console.error("Error al eliminar el guardia:", err);
                const errorMsg = err.status === 404 
                  ? 'El endpoint de eliminación no está disponible en el backend. Contacte al administrador del sistema.'
                  : `Error ${err.status}: ${err.message || 'No se pudo eliminar el guardia.'}`;
                this.showErrorAlert(errorMsg);
              }
            });
          },
        }
      ],
    });
    await alert.present();
  }
  */

  // ==========================================
  // MÉTODO TOGGLE STATUS - IGUAL QUE EN PROPIETARIOS
  // Este método reemplaza la funcionalidad de deleteGuard
  // ==========================================
  public async toggleGuardStatus(userId: number, isActive: boolean) {
    if (!userId) return;
    const enabling = !isActive;
    const header = enabling ? 'Habilitar vigilador' : 'Inhabilitar vigilador';
    const message = enabling
      ? '¿Está seguro que desea habilitar este vigilador?'
      : '¿Está seguro que desea inhabilitar este vigilador?';

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: enabling ? 'Habilitar' : 'Inhabilitar',
          role: 'confirm',
          handler: async () => {
            try {
              await firstValueFrom(this._userService.updateUserStatus(userId, enabling));
              
              // Actualizar el estado en la lista de vigiladores activos
              this.guards = this.guards.map(guard => {
                if (guard.guard.user.id === userId) {
                  return {
                    ...guard,
                    guard: {
                      ...guard.guard,
                      user: {
                        ...guard.guard.user,
                        isActive: enabling
                      }
                    }
                  };
                }
                return guard;
              });

              // Actualizar el estado en la lista de vigiladores inactivos
              this.guardsOut = this.guardsOut.map(guard => {
                if (guard.guard.user.id === userId) {
                  return {
                    ...guard,
                    guard: {
                      ...guard.guard,
                      user: {
                        ...guard.guard.user,
                        isActive: enabling
                      }
                    }
                  };
                }
                return guard;
              });

              const t = await this.toastCtrl.create({
                message: enabling ? 'Vigilador habilitado.' : 'Vigilador inhabilitado.',
                duration: 1400,
                color: 'success',
              });
              await t.present();
            } catch (err) {
              console.error('Error cambiando estado del vigilador:', err);
              const t = await this.toastCtrl.create({
                message: 'No se pudo cambiar el estado.',
                duration: 1800,
                color: 'danger',
              });
              await t.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  public dropdown() {
    this.dropdownState = !this.dropdownState;
  }

  async editGuard(id: any) {
    const modal = await this.modalCtrl.create({
      component: EditGuardPage,
      componentProps: {
        guard_id: id
      }
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadGuards();
    }
  }

  public returnDay(weekday: number): string {
    const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    return days[weekday] || "Fecha equivocada";
  }

  public getWorkingGuardsCount(): number {
    return this.guards.length;
  }

  public getOffDutyGuardsCount(): number {
    return this.guardsOut.length;
  }

  public getTotalGuardsCount(): number {
    return this.guards.length + this.guardsOut.length;
  }

  public isGuardActive(guard: any): boolean {
    const userId = guard?.guard?.user?.id;
    return userId ? this.activeGuardIds.has(Number(userId)) : false;
  }

  public getGuardStatusText(guard: any): string {
    const isActive = this.isGuardActive(guard);
    return isActive ? '🟢 Activo' : '⚪ Inactivo';
  }

  public getGuardStatusColor(guard: any): string {
    const isActive = this.isGuardActive(guard);
    return isActive ? 'success' : 'medium';
  }
  public getGuardAvatar(guard: any): string {
  const url =
    guard?.guard?.user?.profilePicture ||
    guard?.guard?.user?.avatar ||
    guard?.guard?.user?.avatarUrl;

  return url ? url : 'assets/img/default-avatar.jpg';
}

  public get filteredWorkingGuards() {
    if (!this.searchKey || this.searchKey.trim() === '') {
      return this.guards;
    }
    
    const searchTerm = this.searchKey.toLowerCase().trim();
    return this.guards.filter(guard =>
      guard.guard.user.name.toLowerCase().includes(searchTerm) ||
      guard.guard.user.lastname.toLowerCase().includes(searchTerm) ||
      guard.guard.user.dni.includes(searchTerm)
    );
  }

  public get filteredOffDutyGuards() {
    if (!this.searchKey1 || this.searchKey1.trim() === '') {
      return this.guardsOut;
    }
    
    const searchTerm = this.searchKey1.toLowerCase().trim();
    return this.guardsOut.filter(guard =>
      guard.guard.user.name.toLowerCase().includes(searchTerm) ||
      guard.guard.user.lastname.toLowerCase().includes(searchTerm) ||
      guard.guard.user.dni.includes(searchTerm)
    );
  }
}

/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';

//Servicios
import { GuardsService } from '../../../../services/guards/guards.service';
import { UserService } from 'src/app/services/user/user.service';

//Interfaces
import { GuardInterface } from '../../../../interfaces/guard-interface';

// Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";
import { EditGuardPage } from 'src/app/modals/guards/edit-guard/edit-guard.page';

// Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';


@Component({
  selector: 'app-all-guards',
  templateUrl: './all-guards.page.html',
  styleUrls: ['./all-guards.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class AllGuardsPage implements OnInit {

  // CORRECCIÓN 1: Propiedades cambiadas a 'public' e inicializadas.
  public guards: any[] = [];
  public guardsOut: any[] = [];
  public dropdownState: boolean = false;
  public message = 'This modal example uses the modalController to present and dismiss modals.';

  // CORRECCIÓN 2: Se declaran las propiedades que faltaban para las barras de búsqueda.
  public searchKey: string = '';
  public searchKey1: string = '';

  constructor(
    private _guardsService: GuardsService,
    private modalCtrl: ModalController,
    private _userService: UserService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.loadGuards();
  }

  ionViewWillEnter() {
    this.loadGuards();
  }

  async loadGuards() {
    try {
      const guardsObservable = await this._guardsService.getAllByCountryID();
      guardsObservable.subscribe(guards => {
        // Filtramos primero los guardias activos
        const activeGuards = guards.filter(guard => guard.guard.user.isActive !== false);
        
        // Agrupamos los horarios por cada guardia
        const guardsGroupedByUser = this.groupGuardsByUser(activeGuards);
        
        // Separamos los que están trabajando de los que no
        const { working, notWorking } = this.separateWorkingGuards(guardsGroupedByUser);

        this.guards = working;
        this.guardsOut = notWorking;

        console.log('Guardias con horario de trabajo:', this.guards);
        console.log('Guardias sin horario de trabajo:', this.guardsOut);
      });
    } catch (error) {
      console.error("Error al cargar los guardias:", error);
    }
  }

  private groupGuardsByUser(guards: any[]): any[] {
    const userGuardMap = {};
    for (const guard of guards) {
      const userId = guard.guard.user.id;
      if (!userGuardMap[userId]) {
        userGuardMap[userId] = {
          // Se copia toda la información del primer schedule para tener datos del usuario
          ...guard, 
          schedules: [], // Se crea un array para guardar todos los horarios
        };
      }
      userGuardMap[userId].schedules.push(guard);
    }
    return Object.values(userGuardMap);
  }

  private separateWorkingGuards(groupedGuards: any[]) {
    const working = [];
    const notWorking = [];

    for (const userGroup of groupedGuards) {
      // Usamos .some() que es más eficiente para ver si al menos un horario está activo
      const hasWorkingSchedule = userGroup.schedules.some(schedule => schedule.working);
      
      if (hasWorkingSchedule) {
        working.push(userGroup);
      } else {
        notWorking.push(userGroup);
      }
    }
    return { working, notWorking };
  }

  handleRefresh(event) {
    setTimeout(() => {
      this.loadGuards();
      event.target.complete();
    }, 2000);
  }

  async deleteGuard(userId: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Estás seguro?',
      message: 'El guardia será eliminado permanentemente.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          cssClass: 'red',
          handler: () => {
            this._userService.deleteUserById(userId).subscribe({
              next: res => {
                console.log(res);
                // CORRECCIÓN 3: En lugar de recargar toda la página, solo recargamos los datos.
                this.loadGuards(); 
              },
              error: err => console.error("Error al eliminar el guardia:", err)
            });
          },
        }
      ],
    });
    await alert.present();
  }

  public dropdown() {
    this.dropdownState = !this.dropdownState;
  }

  async editGuard(id: any) {
    const modal = await this.modalCtrl.create({
      component: EditGuardPage,
      componentProps: {
        guard_id: id
      }
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      // Si el modal confirma una edición, recargamos la lista para ver los cambios.
      this.loadGuards();
    }
  }

  // Este método no se usa en la lógica principal, pero se mantiene por si lo necesitas.
  public returnDay(weekday: number): string {
    const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    return days[weekday] || "Fecha equivocada";
  }
}*/