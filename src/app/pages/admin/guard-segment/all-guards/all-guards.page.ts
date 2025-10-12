//src/app/pages/admin/guard-segment/all-guards/all-guards.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  private countryId: string | null = null; // Para almacenar el ID del country


  constructor(
    private _guardsService: GuardsService,
    private modalCtrl: ModalController,
    private _userService: UserService,
    private alertCtrl: AlertController,
    private route: ActivatedRoute // Inyectamos ActivatedRoute para obtener parámetros de la URL

  ) { }

  ngOnInit() {
    //this.loadGuards();
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

    // [INICIO DE CÓDIGO REAL - CONSUMO DE API]
    this._guardsService.getAllByCountryID(this.countryId).subscribe({
            // rawGuards será el array de { guard, working } según el contrato del backend.
            next: (rawGuards: any[]) => {
                
                if (!Array.isArray(rawGuards)) {
                    // Si el backend por algún motivo no devuelve un array directamente, manejamos el error.
                    console.error("La API no devolvió un array válido de horarios de vigiladores.");
                    this.guards = [];
                    this.guardsOut = [];
                    return; 
                }
  
      // [COMIENZO CÓDIGO MOCK COMENTADO]
      /*const mockGuardsData: MockGuard[] = [
        {
          id: 1,
          guard: {
            user: {
              id: 101,
              name: 'Diego',
              lastname: 'Moreno',
              dni: '20123456',
              email: 'diego.moreno@security.com',
              phone: '3794111111',
              avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&crop=face',
              isActive: true
            }
          },
          working: true,
          schedules: [
            { id: 1, day: 'Lunes', startTime: '08:00', endTime: '16:00', working: true },
            { id: 2, day: 'Martes', startTime: '08:00', endTime: '16:00', working: true },
            { id: 3, day: 'Miércoles', startTime: '08:00', endTime: '16:00', working: true }
          ]
        },
        {
          id: 2,
          guard: {
            user: {
              id: 102,
              name: 'Fernando',
              lastname: 'López',
              dni: '21234567',
              email: 'fernando.lopez@security.com',
              phone: '3794222222',
              avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
              isActive: true
            }
          },
          working: true,
          schedules: [
            { id: 4, day: 'Jueves', startTime: '16:00', endTime: '24:00', working: true },
            { id: 5, day: 'Viernes', startTime: '16:00', endTime: '24:00', working: true },
            { id: 6, day: 'Sábado', startTime: '16:00', endTime: '24:00', working: true }
          ]
        },
        {
          id: 3,
          guard: {
            user: {
              id: 103,
              name: 'Ricardo',
              lastname: 'Acosta',
              dni: '22345678',
              email: 'ricardo.acosta@security.com',
              phone: '3794333333',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              isActive: true
            }
          },
          working: false,
          schedules: [
            { id: 7, day: 'Domingo', startTime: '00:00', endTime: '08:00', working: false }
          ]
        },
        {
          id: 4,
          guard: {
            user: {
              id: 104,
              name: 'Marcos',
              lastname: 'Villalba',
              dni: '23456789',
              email: 'marcos.villalba@security.com',
              phone: '3794444444',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              isActive: true
            }
          },
          working: true,
          schedules: [
            { id: 8, day: 'Domingo', startTime: '08:00', endTime: '16:00', working: true },
            { id: 9, day: 'Lunes', startTime: '16:00', endTime: '24:00', working: true }
          ]
        }
      ];*/
      // [FIN CÓDIGO MOCK COMENTADO]

      // Filtrar guardias activos. Utilizamos la data real (rawGuards) y optional chaining (?. )
      // La estructura esperada es: item.guard.user.isActive
      //const activeGuards = mockGuardsData.filter(guard => guard.guard.user.isActive !== false);
      const activeGuards = rawGuards.filter(guard => guard.guard?.user?.isActive !== false);

      
      // Agrupar horarios por guardia
      const guardsGroupedByUser = this.groupGuardsByUser(activeGuards);
      
      // Separar los que están trabajando de los que no
      const { working, notWorking } = this.separateWorkingGuards(guardsGroupedByUser);

      this.guards = working;
      this.guardsOut = notWorking;

      //console.log('Guardias con horario de trabajo (DEMO):', this.guards);
      //console.log('Guardias sin horario de trabajo (DEMO):', this.guardsOut);
      console.log('Guardias cargados desde la API:', this.guards.length + this.guardsOut.length);

          },
          error: (err) => {
              console.error("Error al obtener los guardias de la API:", err);
          }
        });
      // [FIN DE CÓDIGO REAL - CONSUMO DE API]

      // Código original comentado
      /*
      const guardsObservable = await this._guardsService.getAllByCountryID();
      guardsObservable.subscribe(guards => {
        const activeGuards = guards.filter(guard => guard.guard.user.isActive !== false);
        const guardsGroupedByUser = this.groupGuardsByUser(activeGuards);
        const { working, notWorking } = this.separateWorkingGuards(guardsGroupedByUser);
        this.guards = working;
        this.guardsOut = notWorking;
      });
      */
    
    } catch (error) {
      console.error("Error al cargar los guardias:", error);
    }
  }

private groupGuardsByUser(guards: any[]): any[] {
    const userGuardMap = {};
    for (const guardSchedule of guards) {
        
        // **INICIO DE VALIDACIÓN CRÍTICA (Basada en Contrato)**
        // Verifica que la relación 'user' anidada exista.
        const userData = guardSchedule.guard?.user;
        if (!userData) {
            console.warn("Elemento de horario sin datos de usuario anidados. Saltando:", guardSchedule);
            continue; // Saltar este elemento si no tiene la relación user
        }
        // **FIN DE VALIDACIÓN CRÍTICA**
        
        const userId = userData.id;

        if (!userGuardMap[userId]) {
            userGuardMap[userId] = {
                // Mantenemos la estructura para que los getters (filteredWorkingGuards) sigan funcionando
                id: userId,
                guard: { user: userData }, 
                schedules: [],
            };
        }
        // Agrega el objeto completo del horario (incluyendo el flag working)
        userGuardMap[userId].schedules.push(guardSchedule);
    }
    return Object.values(userGuardMap);
  }

  private separateWorkingGuards(groupedGuards: any[]) {
    const working = [];
    const notWorking = [];

    for (const userGroup of groupedGuards) {
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
            // Para la demo, solo filtrar el guardia localmente
            this.guards = this.guards.filter(guard => guard.guard.user.id !== userId);
            this.guardsOut = this.guardsOut.filter(guard => guard.guard.user.id !== userId);
            console.log('Guardia eliminado de la demo:', userId);
            
            // Código original comentado
            /*
            this._userService.deleteUserById(userId).subscribe({
              next: res => {
                console.log(res);
                this.loadGuards(); 
              },
              error: err => console.error("Error al eliminar el guardia:", err)
            });
            */
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
      this.loadGuards();
    }
  }

  public returnDay(weekday: number): string {
    const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    return days[weekday] || "Fecha equivocada";
  }

  // Métodos adicionales para la demo
  public getWorkingGuardsCount(): number {
    return this.guards.length;
  }

  public getOffDutyGuardsCount(): number {
    return this.guardsOut.length;
  }

  public getTotalGuardsCount(): number {
    return this.guards.length + this.guardsOut.length;
  }

  // Getter para guardias filtrados
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