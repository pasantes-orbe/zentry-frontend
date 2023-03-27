import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ScheduleService } from 'src/app/services/schedule/schedule.service';

@Component({
  selector: 'app-edit-guard',
  templateUrl: './edit-guard.page.html',
  styleUrls: ['./edit-guard.page.scss'],
})
export class EditGuardPage implements OnInit {
  @Input("guard_id") guard_id;

  schedule: any[];

  name: string;

  constructor(private modalCtrl: ModalController, private scheduleService: ScheduleService) {}

  async ngOnInit() {
    console.log(this.guard_id);
  
    this.scheduleService.getScheduleById(this.guard_id).subscribe(
      res => this.schedule = res
    )

  }

  editSchedule(id, start, exit){
    console.log("ID del calendario", id, "Inicio", start, " Salida", exit)

    

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.name, 'confirm');
  }

}
