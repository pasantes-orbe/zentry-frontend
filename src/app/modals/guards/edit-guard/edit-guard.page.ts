import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import moment from 'moment';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

import { ScheduleService } from 'src/app/services/schedule/schedule.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonModal, IonDatetime, IonDatetimeButton, IonItem, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { add, trash, create, close, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-edit-guard',
  templateUrl: './edit-guard.page.html',
  styleUrls: ['./edit-guard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonModal, IonDatetime, IonDatetimeButton, IonItem, IonSelect, IonSelectOption
  ]
})
export class EditGuardPage {

  @Input() guard_id: number;
  schedule = [];
  newScheduleHour = [];

  constructor(
    private modalCtrl: ModalController,
    private scheduleService: ScheduleService,
    private toastController: ToastController,
    private _countryStorage: CountryStorageService,
    private alertCtrl: AlertController
  ) {
    addIcons({ add, trash, create, close, checkmarkCircleOutline, closeCircleOutline });
  }

  ionViewWillEnter() {
    this.scheduleService.getScheduleById(this.guard_id).subscribe(res => {
      this.schedule = res.map(x => ({
        id: x.id,
        week_day: x.week_day,
        start: moment(x.start).format("HH:mm"),
        exit: moment(x.exit).format("HH:mm"),
      }));
    });
  }

  private toDBFormat(h: string): string {
    return `1970-01-01 ${h}:00`;
  }

  editSchedule(id, start, exit, week_day) {
    this.scheduleService.editSchedule(
      id,
      this.toDBFormat(start),
      this.toDBFormat(exit),
      week_day
    ).subscribe(() => {
      this.okToast("Horario actualizado");
      this.ionViewWillEnter();
    }, () => this.errToast());
  }

  async newHourOnSchedule(start, exit, week_day) {
    const country = await this._countryStorage.getCountry();
    this.scheduleService.newHourOnSchedule(
      this.guard_id,
      country.id,
      week_day,
      this.toDBFormat(start),
      this.toDBFormat(exit)
    ).subscribe(() => {
      this.newScheduleHour = [];
      this.okToast("Horario agregado");
      this.ionViewWillEnter();
    }, () => this.errToast());
  }

  deleteSchedule(id) {
    this.scheduleService.deleteScheduleById(id).subscribe(() => {
      this.okToast("Horario eliminado");
      this.ionViewWillEnter();
    }, () => this.errToast());
  }

  newSchedule() {
    this.newScheduleHour.push({
      week_day: "lunes",
      start: "09:00",
      exit: "17:00"
    });
  }

  cancel() { this.modalCtrl.dismiss(); }

  async okToast(msg: string) {
    const toast = await this.toastController.create({ message: msg, duration: 1200, color: 'success' });
    toast.present();
  }

  async errToast() {
    const toast = await this.toastController.create({ message: "Error, intenta nuevamente.", duration: 1500, color: 'danger' });
    toast.present();
  }
}
