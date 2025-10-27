//src/app/pages/admin/country-recurrents/add-recurrent/add-recurrent.page.ts
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
  private currentStatus?: boolean; // status actual para PATCH

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
        this.currentStatus = (rec as any).status as boolean | undefined;
        // Pre-cargar propiedades del country para que el buscador esté "habilitado" al editar
        this.loadPropertiesByCountry();
      });
    }
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', [Validators.required, Validators.min(1000000), Validators.max(100000000)]],
      property: ['', [Validators.required]],
      roleRecurrent: ['Invitado Recurrente', [Validators.required]],
    });
  }

  // Búsqueda de propiedades por término
  public async getProperties(event: any): Promise<void> {
    const termino = event?.detail?.value;
    if (termino && termino.length > 0) {
      try {
        const obs = await this._propertiesService.getBySearchTerm(termino);
        obs.subscribe((properties) => {
          const list = Array.isArray(properties) ? properties : [];
          this.properties = this.normalizeProperties(list);
        });
      } catch (error) {
        console.error('Error al buscar propiedades:', error);
        this.properties = [];
      }
    } else {
      // Si no hay término, mostrar listado por country (útil en edición)
      this.loadPropertiesByCountry();
    }
  }

  // Carga propiedades del country actual para habilitar selección sin necesidad de escribir
  private async loadPropertiesByCountry(): Promise<void> {
    try {
      const obs = await this._propertiesService.getByCountry();
      obs.subscribe((list) => {
        const arr = Array.isArray(list) ? list : [];
        this.properties = this.normalizeProperties(arr);
      });
    } catch (err) {
      console.error('Error pre-cargando propiedades del country:', err);
      this.properties = [];
    }
  }

  private normalizeProperties(list: any[]): PropertyInterface[] {
    return list
      .map((p: any) => p?.property ?? p)
      .filter((p: any) => p && (p.id != null))
      .map((p: any) => ({
        id: Number(p.id),
        name: String(p.name ?? ''),
        number: Number(p.number ?? 0),
        address: String(p.address ?? ''),
        avatar: String(p.avatar ?? ''),
        idCountry: Number(p.id_country ?? p.idCountry ?? 0)
      }) as PropertyInterface);
  }

  // Alta o edición según exista recurrentId
  public async saveRecurrent(): Promise<void> {
    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, complete todos los campos requeridos.');
      return;
    }

    const v = this.form.value;
    const defaultDays = 'lunes,martes,miercoles,jueves,viernes,sabado,domingo';
    const userRole: 'admin' | 'owner' = 'admin'; // ✅ acá es admin

    const payload = {
      id_property: v.property,
      guest_name: v.name,
      guest_lastname: v.lastname,
      dni: v.dni,
      roleRecurrent: v.roleRecurrent as string,
      access_days: defaultDays,
    };

    try {
      if (this.recurrentId) {
        // EDITAR
        const updatePayload = { status: this.currentStatus, ...payload };
        this._recurrentsService.updateRecurrent(this.recurrentId, updatePayload).subscribe(() => {
          this._alertService.presentAlert('Éxito: Recurrente actualizado.');
          this._router.navigate(['/admin/country-recurrents']); 
        });
      } else {
        // CREAR
        await this._recurrentsService.addRecurrent(
          v.property,
          v.name, 
          v.lastname, 
          v.dni,
          userRole, 
          v.roleRecurrent,
          defaultDays
        ); 
        // addRecurrent ya hace navigate y alerts
      }
    } catch (err) {
      console.error('Error guardando recurrente:', err);
      this._alertService.presentAlert('Error: No se pudo guardar el recurrente. Intente nuevamente.');
    }
  }
}
