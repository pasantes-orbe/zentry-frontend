import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

//Servicios
import { AlertService } from 'src/app/services/helpers/alert.service';
import { EmailHelperService } from 'src/app/services/helpers/email-helper.service';
import { RegisterService } from '../../../../services/auth/register.service';
import { ScheduleService } from 'src/app/services/schedule/schedule.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

// Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-add-guard',
  templateUrl: './add-guard.page.html',
  styleUrls: ['./add-guard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddGuardPage implements OnInit {

  public newImg: any = "https://ionicframework.com/docs/img/demos/card-media.png";

  @ViewChild('passwordShowIcon') passIcon;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(
    private _emailHelperService: EmailHelperService, 
    protected _formBuilder: FormBuilder, 
    protected _alertService: AlertService, 
    private http: HttpClient, 
    private _router: Router, 
    private _registerService: RegisterService,
    private _scheduleService: ScheduleService,
    private _countryStorageService: CountryStorageService
  ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }
  
  ngOnInit() {
  }

  onFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño del archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this._alertService.presentAlert('El archivo es muy grande. Máximo 5MB permitido.');
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this._alertService.presentAlert('Solo se permiten archivos de imagen.');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => this.newImg = reader.result;
      reader.readAsDataURL(file);
      
      this.form.patchValue({
        fileSource: file
      });
    }
  }

  // Método para activar el file input desde el botón
  public triggerFileInput(): void {
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  async addGuard(){
    if (this.form.invalid) {
      this._alertService.presentAlert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Obtener los días seleccionados y horarios
    const workDays = this.getForm().get('workDays').value;
    const startTime = this.getForm().get('startTime').value;
    const endTime = this.getForm().get('endTime').value;

    // Validar que al menos un día esté seleccionado
    const hasSelectedDays = Object.values(workDays).some(day => day === true);
    if (!hasSelectedDays) {
      this._alertService.presentAlert('Por favor, seleccione al menos un día de trabajo.');
      return;
    }

    try {
      // Primero registrar el usuario
      await this._alertService.setLoading('Registrando vigilador...');
      
      // Llamar al servicio de registro y esperar la respuesta
      this._registerService.registerWithCallback(
        this.getForm().get('vigilatorName').value,
        this.getForm().get('vigilatorLastname').value,
        this.getForm().get('vigilatorDNI').value,
        this.getForm().get('vigilatorEmail').value,
        this.getForm().get('vigilatorPassword').value,
        this.getForm().get('vigilatorPhone').value,
        this.getForm().get('vigilatorBirthdate').value,
        this.getForm().get('fileSource').value,
        'vigilador',
        async (userId: number) => {
          // Callback: después de crear el usuario, crear los horarios
          await this.createSchedulesForGuard(userId, workDays, startTime, endTime);
        }
      );
    } catch (error) {
      await this._alertService.removeLoading();
      console.error('Error al registrar guardia:', error);
      this._alertService.showAlert('Error', 'No se pudo registrar el vigilador');
    }
  }

  private async createSchedulesForGuard(userId: number, workDays: any, startTime: string, endTime: string) {
    const country = await this._countryStorageService.getCountry();
    const countryId = country?.id;

    console.log('=== DEBUG: Creando horarios ===');
    console.log('userId:', userId);
    console.log('countryId:', countryId);
    console.log('workDays:', workDays);
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);

    if (!countryId) {
      console.error('No se encontró el ID del country');
      return;
    }

    // Mapeo de días a números (1=Lunes, 7=Domingo)
    const dayMapping = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7
    };

    // Crear horarios para cada día seleccionado
    const schedulePromises = [];
    for (const [dayName, isSelected] of Object.entries(workDays)) {
      if (isSelected) {
        const dayNumber = dayMapping[dayName];
        console.log(`Creando horario para ${dayName} (día ${dayNumber})`);
        const promise = this._scheduleService.saveSchedule(
          dayNumber,
          startTime,
          endTime,
          userId,
          countryId
        );
        schedulePromises.push(promise);
      }
    }

    // Esperar a que se creen todos los horarios
    try {
      await Promise.all(schedulePromises);
      console.log('✅ Horarios creados exitosamente para el guardia:', userId);
    } catch (error) {
      console.error('❌ Error al crear horarios:', error);
    }
  }

  public getForm(): FormGroup {
    return this.form;
  }

  public getWorkDaysGroup(): FormGroup {
    return this.form.get('workDays') as FormGroup;
  }

  private createForm(): FormGroup{
    return this.formBuilder.group({
      vigilatorName: ['', [Validators.required, Validators.minLength(3)]],
      vigilatorLastname:['', [Validators.required, Validators.minLength(5)]],
      vigilatorDNI:['',[Validators.required, Validators.min(1000000),Validators.max(100000000)]],
      vigilatorEmail: ['', [Validators.required, Validators.pattern(this._emailHelperService.getEmailPattern())]],
      vigilatorPassword: ['', [Validators.required, Validators.minLength(4)]],
      vigilatorPhone: ['', [Validators.required, Validators.max(10000000000)]],
      vigilatorBirthdate: ['', Validators.required],
      vigilatorAvatar: new FormControl('', [Validators.required]),
      fileSource: new FormControl('', [Validators.required]),
      // Campos de horario
      workDays: this.formBuilder.group({
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false],
        sunday: [false]
      }),
      startTime: ['08:00', Validators.required],
      endTime: ['16:00', Validators.required]
    });
  }

  private changeIcon(input): void {
    (this.getPasswordType(input) === "password")
      ? this.passIcon.name = "eye-outline"
      : this.passIcon.name = "eye-off-outline"
  }

  protected showPassword(input): void {
    (this.getPasswordType(input) === "password")
      ? this.setPasswordType(input, "text")
      : this.setPasswordType(input, "password");
    this.changeIcon(input);
  }
  
  private getPasswordType(input): string {
    return input.type;
  }
  
  private setPasswordType(input, type): void {
    input.type = type;
  }
}