import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//Servicios
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { ScheduleService } from '../../../../services/schedule/schedule.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { GuardStorageService } from 'src/app/services/storage/guard-storage.service'; // ⬅️ Necesario para removeGuard()

// Interfaces
import { ScheduleInterface } from 'src/app/interfaces/schedule-interface';

// Modelos
import { Schedule } from 'src/app/models/schedule-class';

// Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";


@Component({
  selector: 'app-add-laboral-schedule',
  templateUrl: './add-laboral-schedule.page.html',
  styleUrls: ['./add-laboral-schedule.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddLaboralSchedulePage implements OnInit {

  public schedule: Schedule[] = [];
  // Aunque no se use en ngOnInit, es útil para el flujo de prueba por URL
  protected guardId: number;  
  protected countryId: number;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(  
    protected _formBuilder: FormBuilder,
    protected _loading: LoadingService,
    private _scheduleService: ScheduleService,
    private _alertService: AlertService,
    private _router: Router,
    // ✅ CORRECCIÓN: Faltaba ActivatedRoute y el GuardStorageService
    private _activatedRoute: ActivatedRoute,
    private _guardStorageService: GuardStorageService 
    ) {
      this.formBuilder = _formBuilder;
      this.form = this.createForm();
     }

  ngOnInit() {
    // Lógica para leer la URL (para pruebas o si la tarjeta la usa)
    this._activatedRoute.queryParams.subscribe(params => { 
        this.guardId = +params['guardId'];
        this.countryId = +params['countryId'];
        // Si no hay IDs, el servicio los buscará en el Storage (flujo de registro)
        if (!this.guardId || !this.countryId) {
             console.warn('Advertencia: IDs de Vigilador o Country no encontrados en la URL. Usando IDs del Storage.');
        }
    });
  
    console.log(this.schedule.length);
  }

  public createForm(): FormGroup{
    return this.formBuilder.group({
      day: ['', [Validators.required]],
      start: ['', [Validators.required]],
      exit: ['', [Validators.required]],  // id usuario e id country 
    });
  }


  public getForm(): FormGroup {
    return this.form;
  }

  public async guardarCalendario(){

    await this._alertService.setLoading(); 

    console.log("CALENDARIO A ENVIAR", this.schedule);

    // Llamamos al servicio, pasándole los IDs si existen (vienen de la URL)
    // Si guardId/countryId son undefined/0, el servicio usará el Storage.
    this.schedule.map( async horario => {
      return this._scheduleService.saveSchedule(
          horario.getDay(), 
          horario.getStart(), 
          horario.getExit(),
          this.guardId,   // ID de la URL
          this.countryId  // ID de la URL
      );
    });

    // Esperamos un momento para que las llamadas `subscribe` se inicien
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // ✅ PASO CLAVE: LIMPIAR EL CONTEXTO DEL VIGILADOR
    // Se borra el ID de Storage para que no afecte la próxima vez que se use el flujo de registro.
    await this._guardStorageService.remove(); 

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

    console.log("ESTO ES LO QUE ESTOY AGERGANDO", horario);

    this.schedule.push(horario)

    console.log("asi esta", this.schedule);
  }

}