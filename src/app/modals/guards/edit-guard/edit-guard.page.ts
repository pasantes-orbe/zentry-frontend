import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ScheduleService } from 'src/app/services/schedule/schedule.service';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-guard',
  templateUrl: './edit-guard.page.html',
  styleUrls: ['./edit-guard.page.scss'],
})
export class EditGuardPage implements OnInit {
  @Input("guard_id") guard_id;

  schedule: any[];

  name: string;

  constructor(private modalCtrl: ModalController, private scheduleService: ScheduleService, private toastController: ToastController) {}

  async ngOnInit() {

    console.log(this.guard_id);
  
    this.scheduleService.getScheduleById(this.guard_id).subscribe(
      res => this.schedule = res
    )

  }

  async editSchedule(id, start: Date, exit: Date){

    console.log("SIN FORMATEAR START", start, "SIN FORMATEAR EXIT", exit);



    // console.log("SIN FORMATEAR START", momentStart, "SIN FORMATEAR EXIT", momentExit);

    
    const startFormateado = moment(start).format('YYYY-MM-DDTHH:mm:ss.000-00:00')
    const exitFormateado = moment(exit).format('YYYY-MM-DDTHH:mm:ss.000-00:00') 

    // "2023-01-23T08:00:00.000-00:00"

    console.log("START FORMATEADO", startFormateado, "EXIT FORMATEADO", exitFormateado);

    this.scheduleService.editSchedule(id, startFormateado, exitFormateado).subscribe(
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

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.name, 'confirm');
  }


  async correctlyToast() {
    const toast = await this.toastController.create({
      message: 'Cambios guardados correctamente!',
      duration: 2000,
      position: 'top'
    });

    await toast.present();
  }

  async errorToast() {
    const toast = await this.toastController.create({
      header: 'Ha ocurrido un error al cambiar los horarios!',
      message: 'Por favor intente nuevamente',
      duration: 2000,
      position: 'top'
    });

    await toast.present();
  }

}
