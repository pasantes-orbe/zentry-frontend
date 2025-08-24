import { Component, OnInit } from '@angular/core';
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
}