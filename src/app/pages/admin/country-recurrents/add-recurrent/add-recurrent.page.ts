import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Servicios
import { AlertService } from 'src/app/services/helpers/alert.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';

// Interfaces
import { PropertyInterface } from 'src/app/interfaces/property-interface';

// Componentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

@Component({
  selector: 'app-add-recurrent',
  templateUrl: './add-recurrent.page.html',
  styleUrls: ['./add-recurrent.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddRecurrentPage implements OnInit {

  public form: FormGroup;
  public properties: PropertyInterface[] = [];
  public selectedValue: any;
  private recurrentId?: number; // si viene => modo edición

  constructor(
    private _formBuilder: FormBuilder,
    private _propertiesService: PropertiesService,
    private _recurrentsService: RecurrentsService,
    private _router: Router,
    private _alertService: AlertService,
    private _route: ActivatedRoute
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    // si viene param :recurrentId → modo edición
    const idParam = this._route.snapshot.paramMap.get('recurrentId');
    this.recurrentId = idParam ? Number(idParam) : undefined;

    if (this.recurrentId) {
      this._recurrentsService.getById(this.recurrentId).subscribe((rec) => {
        if (!rec) return;
        // Ajustá los nombres si tu API difiere
        this.form.patchValue({
          name: (rec as any).guest_name,
          lastname: (rec as any).guest_lastname,
          dni: (rec as any).dni,
          property: (rec as any).id_property ?? ''
        });
      });
    }
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', [Validators.required, Validators.min(1000000), Validators.max(100000000)]],
      property: ['', [Validators.required]],
    });
  }

  // Búsqueda de propiedades por término
  public async getProperties(event: any): Promise<void> {
    const termino = event?.detail?.value;
    if (termino && termino.length > 2) {
      try {
        const obs = await this._propertiesService.getBySearchTerm(termino);
        obs.subscribe((properties) => { this.properties = properties || []; });
      } catch (error) {
        console.error('Error al buscar propiedades:', error);
        this.properties = [];
      }
    } else {
      this.properties = [];
    }
  }

  // Alta o edición según exista recurrentId
  public async saveRecurrent(): Promise<void> {
    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, complete todos los campos requeridos.');
      return;
    }

    const v = this.form.value;
    const payload = {
      id_property: v.property,
      guest_name: v.name,
      guest_lastname: v.lastname,
      dni: v.dni
    };

    try {
      if (this.recurrentId) {
        // EDITAR
        this._recurrentsService.updateRecurrent(this.recurrentId, payload).subscribe(() => {
          this._alertService.presentAlert('Éxito: Recurrente actualizado.');
          this._router.navigate(['/admin/country-recurrents']);
        });
      } else {
        // CREAR
        await this._recurrentsService.addRecurrent(v.property, v.name, v.lastname, v.dni, 'admin');
        // addRecurrent ya hace navigate y alerts
      }
    } catch (err) {
      console.error('Error guardando recurrente:', err);
      this._alertService.presentAlert('Error: No se pudo guardar el recurrente. Intente nuevamente.');
    }
  }
}
