import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScheduleInterface } from 'src/app/interfaces/schedule-interface';
import { Schedule } from 'src/app/models/schedule-class';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { ScheduleService } from '../../../../services/schedule/schedule.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-laboral-schedule',
  templateUrl: './add-laboral-schedule.page.html',
  styleUrls: ['./add-laboral-schedule.page.scss'],
})
export class AddLaboralSchedulePage implements OnInit {

  protected schedule: Schedule[] = [];
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(  protected _formBuilder: FormBuilder,
    protected _loading: LoadingService,
    private _scheduleService: ScheduleService,
    private _alertService: AlertService,
    private _router: Router) {
      this.formBuilder = _formBuilder;
      this.form = this.createForm();
     }

  ngOnInit() {
  }

  public createForm(): FormGroup{
    return this.formBuilder.group({
      day: ['', [Validators.required]],
      start: ['', [Validators.required]],
      exit: ['', [Validators.required]],  // id usuario e id country 
    });
  }


  public getForm(): FormGroup {
    return this.form;
  }

  public async guardarCalendario(){
    await this._alertService.setLoading(); 
    for (const horario of this.schedule) {
      this._scheduleService.saveSchedule(horario.getDay(), horario.getStart(), horario.getExit())
    }
    await this._alertService.removeLoading()
    this._router.navigate([`/admin/todos-los-guardias`]);
    await this._alertService.showAlert("Se agrego correctamente los horarios")
  }


  public addHourToSchedule(){
    const horario = new Schedule(
      this.getForm().get('day').value,
      this.getForm().get('start').value,
      this.getForm().get('exit').value
    )

    this.schedule.push(horario)
    console.log(this.schedule)
  }

}