import { Component, OnInit, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// Servicios + tipos
import { CountriesService } from '../../../services/countries/countries.service';
import { CountryStorageService } from '../../../services/storage/country-storage.service';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { CountryInteface } from '../../../interfaces/country-interface';

// Componentes
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-country-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    NavbarAdminComponent
  ],
  templateUrl: './country-dashboard.page.html',
  styleUrls: ['./country-dashboard.page.scss']
})
export class CountryDashboardPage implements OnInit {
  @ViewChild(NavbarAdminComponent) navbar?: NavbarAdminComponent;

  // Estado
  loading = true;
  type = 'propiedades'; // segmento activo
  country: CountryInteface | null = null;

  // Mock por defecto para poder entrar al dashboard sin data real
  private readonly MOCK_COUNTRY: CountryInteface = {
    id: 0,
    name: 'Demo Country',
    avatar: 'https://placehold.co/800x400?text=Country+Demo',
    image: '',
    latitude: -27.56,
    longitude: -58.75,
    isActive: true
  };

  // Señales/derivadas
  countryName = computed(() => this.country?.name ?? 'Country');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private countriesSvc: CountriesService,
    private countryStorage: CountryStorageService,
    public theme: ThemeService
  ) {}

  async ngOnInit(): Promise<void> {
    // Tema por rol
    this.theme.init('admin');

    // 1) Si viene ?id=123, cargamos desde backend por ID
    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      this.countriesSvc.getByID(+idParam).subscribe({
        next: (c) => {
          this.country = c as CountryInteface;
          this.countryStorage.saveCountry(this.country); // cache
          this.loading = false;
        },
        error: async (err) => {
          console.error('No se pudo cargar el country por id:', err);
          // Fallback a storage o mock
          await this.loadFromStorageOrMock();
        }
      });
      return;
    }

    // 2) Sin id -> intentar storage, sino mock
    await this.loadFromStorageOrMock();
  }

  private async loadFromStorageOrMock() {
    try {
      const c = await this.countryStorage.getCountry();
      if (c) {
        this.country = c;
      } else {
        // ⚠️ MOCK habilitado para poder navegar sin datos reales
        this.country = this.MOCK_COUNTRY;

        // ============================
        //  LÓGICA REAL (BACKEND)
        // ============================
        // Cuando el backend esté listo y haya al menos un country en DB,
        // podés reemplazar el mock por uno de estos flujos:
        //
        // a) Cargar el último país usado por el admin:
        // this.countriesSvc.getLastUsedByAdmin(adminId).subscribe({
        //   next: c => { this.country = c; this.countryStorage.saveCountry(c); this.loading = false; },
        //   error: () => { this.country = this.MOCK_COUNTRY; this.loading = false; }
        // });
        //
        // b) Traer lista y elegir el primero:
        // this.countriesSvc.getAll().subscribe({
        //   next: list => {
        //     if (list?.length) {
        //       this.country = list[0];
        //       this.countryStorage.saveCountry(list[0]);
        //     } else {
        //       this.country = this.MOCK_COUNTRY;
        //     }
        //     this.loading = false;
        //   },
        //   error: () => { this.country = this.MOCK_COUNTRY; this.loading = false; }
        // });
      }
    } catch (e) {
      console.error('Error leyendo country del storage:', e);
      this.country = this.MOCK_COUNTRY;
    } finally {
      this.loading = false;
    }
  }

  // ==========================
  // UI helpers
  // ==========================
  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? (ev?.target as HTMLInputElement)?.checked ?? false;
    this.theme.set('admin', checked ? 'dark' : 'light');
  }

  getCountryImage(c?: CountryInteface): string {
    const item = c ?? this.country;
    return (
      item?.image ||
      item?.avatar ||
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    );
  }

  // ==========================
  // Navegación (pasamos id por query param)
  // ==========================
  backToAdminHome() {
    this.router.navigate(['/admin/home']);
  }

  // Propiedades / Dueños
  goToViewProperties() {
    this.router.navigate(['/admin/view-properties'], { queryParams: { countryId: this.country?.id } });
  }
  goToViewOwners() {
    this.router.navigate(['/admin/view-owners'], { queryParams: { countryId: this.country?.id } });
  }
  goToRecurrents() {
    this.router.navigate(['/admin/country-recurrents'], { queryParams: { countryId: this.country?.id } });
  }
  goToAddProperty() {
    this.router.navigate(['/admin/add-property'], { queryParams: { countryId: this.country?.id } });
  }

  // Vigiladores
  goToAllGuards() {
    this.router.navigate(['/admin/all-guards'], { queryParams: { countryId: this.country?.id } });
  }
  goToCheckInOutHistorial() {
    this.router.navigate(['/admin/checkin-out-historial'], { queryParams: { countryId: this.country?.id } });
  }
  goToAntipanicHistorial() {
    this.router.navigate(['/admin/antipanic-historial'], { queryParams: { countryId: this.country?.id } });
  }
  goToMapGuards() {
    // En tu proyecto esta ruta venía sin prefijo /admin
    this.router.navigate(['/map-guards'], { queryParams: { countryId: this.country?.id } });
  }

  // Eventos / Amenities
  goToAmenities() {
    this.router.navigate(['/admin/view-all-amenities'], { queryParams: { countryId: this.country?.id } });
  }
  goToEventsHistorial() {
    this.router.navigate(['/admin/events-historial'], { queryParams: { countryId: this.country?.id } });
  }
}
