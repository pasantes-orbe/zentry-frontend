
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as moment from 'moment';

// Servicios y Tipos desde @ionic/angular
import { AlertController, ModalController, ToastController } from '@ionic/angular';

// Servicios propios
import { ScheduleService } from 'src/app/services/schedule/schedule.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

// Componentes para el template desde @ionic/angular/standalone
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonModal,
  IonDatetime,
  IonDatetimeButton,
  IonItem,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

// Importaciones para los Íconos
import { addIcons } from 'ionicons';
import { add, trash, create, close, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';


@Component({
  selector: 'app-edit-guard',
  templateUrl: './edit-guard.page.html',
  styleUrls: ['./edit-guard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonModal,
    IonDatetime,
    IonDatetimeButton,
    IonItem,
    IonSelect,
    IonSelectOption
  ]
})
export class EditGuardPage implements OnInit {
  @Input("guard_id") guard_id;

  schedule: any[];
  newScheduleHour: any[] = [];
  name: string;

  constructor(
    private modalCtrl: ModalController,
    private scheduleService: ScheduleService,
    private toastController: ToastController,
    private _countryStorage: CountryStorageService,
    private alertCtrl: AlertController
  ) {
    addIcons({ add, trash, create, close, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    console.log(this.guard_id);
    this.scheduleService.getScheduleById(this.guard_id).subscribe(
      res => {
        const map = res.map(x => {
          return {
            exit: moment.utc(x.exit).local().format("YYYY-MM-DDTHH:mm:ssZ"),
            id: x.id,
            start: moment.utc(x.start).local().format("YYYY-MM-DDTHH:mm:ssZ"),
            week_day: x.week_day
          }
        })
        this.schedule = map.sort(this.sortByWeekDay)
      }
    )
  }

  async editSchedule(id, start: Date, exit: Date, week_day) {
    console.log('Editando horario:', { id, start, exit, week_day });
    this.scheduleService.editSchedule(id, start, exit, week_day).subscribe({
      next: async res => {
        console.log('Horario editado exitosamente:', res);
        await this.correctlyToast();
        this.ionViewWillEnter(); // Recargar los horarios
      },
      error: async error => {
        console.error('Error al editar horario:', error);
        await this.errorToast();
      }
    });
  }

  public sortByWeekDay(a, b) {
    const weekDays = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const weekDayA = weekDays.indexOf(a.week_day);
    const weekDayB = weekDays.indexOf(b.week_day);
    return weekDayA - weekDayB;
  }

  newSchedule() {
    this.newScheduleHour.push({
      start: '2022-04-21T00:00:00',
      exit: '2022-04-21T00:00:00',
      week_day: "lunes",
    })
  }

  async newHourOnSchedule(start, exit, week_day) {
    try {
      const country = await this._countryStorage.getCountry();
      const id_country = country.id;
      console.log('Agregando nuevo horario:', { start, exit, week_day, id_country });
      
      this.scheduleService.newHourOnSchedule(this.guard_id, id_country, week_day, start, exit).subscribe({
        next: async res => {
          console.log('Horario agregado exitosamente:', res);
          await this.correctlyToast();
          this.newScheduleHour = []; // Limpiar el formulario
          this.ionViewWillEnter(); // Recargar los horarios
        },
        error: async error => {
          console.error('Error al agregar horario:', error);
          await this.errorToast();
        }
      });
    } catch (error) {
      console.error('Error al obtener country:', error);
      await this.errorToast();
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async deleteSchedule(id) {
    const alerta = await this.alertCtrl.create({
      header: '¿Estás seguro de borrar este horario?',
      message: 'El mismo no volverá a estar disponible.',
      buttons: [
        {
          text: 'Confirmar',
          cssClass: 'red',
          role: 'confirm',
          handler: () => {
            this.scheduleService.deleteScheduleById(id).subscribe(res => {
              console.log(res);
              this.ionViewWillEnter();
              this.correctlyToast();
            })
          },
        },
        // Botón de cancelar para una mejor UX
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Borrado cancelado');
          },
        },
      ],
    });
    await alerta.present();
  }

  confirm() {
    return this.modalCtrl.dismiss(this.name, 'confirm');
  }

  // --- MÉTODOS QUE FALTABAN ---
  async correctlyToast() {
    const toast = await this.toastController.create({
      message: 'Cambios guardados correctamente!',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  async errorToast() {
    const toast = await this.toastController.create({
      header: 'Ha ocurrido un error',
      message: 'Por favor intente nuevamente.',
      duration: 2500,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}