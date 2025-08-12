import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf, *ngFor
import { FormsModule } from '@angular/forms';   // ¡Muy importante! Para [(ngModel)]
import * as moment from 'moment';

// Servicios y Tipos desde @ionic/angular (la ruta principal)
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
// Agrega aquí los nombres de TODOS los íconos que usas en el HTML
import { add, trash, create, close, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';


@Component({
  selector: 'app-edit-guard',
  templateUrl: './edit-guard.page.html',
  styleUrls: ['./edit-guard.page.scss'],
  standalone: true, // <-- 1. Se convierte a Standalone
  imports: [ // <-- 2. Se agregan todas las importaciones necesarias
    CommonModule,
    FormsModule, // Para que [(ngModel)] funcione

    // Lista de componentes de Ionic usados en el HTML
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
    // <-- 3. Se registran los íconos
    addIcons({ add, trash, create, close, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    console.log(this.guard_id);
    this.scheduleService.getScheduleById(this.guard_id).subscribe(
      res => {
        const map = res.map(x => {
          console.log("XSTART", x.start);
          return {
            exit: moment.utc(x.exit).local().format("YYYY-MM-DDTHH:mm:ssZ"),
            id: x.id,
            start: moment.utc(x.start).local().format("YYYY-MM-DDTHH:mm:ssZ"),
            week_day: x.week_day
          }
        })
        console.log(map);
        this.schedule = map.sort(this.sortByWeekDay)
      }
    )
  }

  async editSchedule(id, start: Date, exit: Date, week_day) {
    console.log("SIN FORMATEAR START", start, "SIN FORMATEAR EXIT", exit);
    console.log("DIA DE LA SEMANA", week_day);
    this.scheduleService.editSchedule(id, start, exit, week_day).subscribe(
      async res => {
        console.log(res);
        await this.correctlyToast()
      },
      async error => {
        console.log(error);
        await this.errorToast()
      }
    )
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
    console.log(this.newScheduleHour);
  }

  async newHourOnSchedule(start, exit, week_day) {
    console.log(this.guard_id);
    const id_country = await (await this._countryStorage.getCountry()).id
    this.scheduleService.newHourOnSchedule(this.guard_id, id_country, week_day, start, exit).subscribe(
      res => {
        console.log(res);
        this.correctlyToast()
      }
    )
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async deleteSchedule(id) {
    console.log(id);
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
              this.ionViewWillEnter()
              this.correctlyToast()
            })
          },