import { Component, OnInit, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';

import { CountriesService } from '../../../services/countries/countries.service';
import { CountryStorageService } from '../../../services/storage/country-storage.service';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryInteface } from '../../../interfaces/country-interface';

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

  loading = true;
  type = 'propiedades';
  country: CountryInteface | null = null;

  private readonly MOCK_COUNTRY: CountryInteface = {
    id: 0,
    name: 'Demo Country',
    avatar: 'https://placehold.co/800x400?text=Country+Demo',
    image: '',
    latitude: -27.56,
    longitude: -58.75,
    isActive: true
  };

  countryName = computed(() => this.country?.name ?? 'Country');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private countriesSvc: CountriesService,
    private countryStorage: CountryStorageService,
    public theme: ThemeService,
    private userStorage: UserStorageService,
    private popoverCtrl: PopoverController
  ) {}

  async ngOnInit(): Promise<void> {
    this.theme.init('admin');

    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      this.countriesSvc.getByID(+idParam).subscribe({
        next: (c) => {
          this.country = c as CountryInteface;
          this.countryStorage.saveCountry(this.country);
          this.loading = false;
        },
        error: async (err) => {
          console.error('No se pudo cargar el country por id:', err);
          await this.loadFromStorageOrMock();
        }
      });
      return;
    }

    await this.loadFromStorageOrMock();
  }

  private async loadFromStorageOrMock() {
    try {
      const c = await this.countryStorage.getCountry();
      if (c) {
        this.country = c;
      } else {
        this.country = this.MOCK_COUNTRY;
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
    const checked = ev?.detail?.checked ?? false;
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
  // POP OVER MENU
  // ==========================
  async logout(): Promise<void> {
    try {
      await this.userStorage.clearUser();
      await this.countryStorage.clearCountry();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (err) {
      console.error('Error al cerrar sesión', err);
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  backToAdminHome() {
    this.router.navigate(['/admin/home']);
  }

  // ==========================
  // Navegación
  // ==========================
  goToViewProperties() {
    this.router.navigate(['/admin/view-properties'], { queryParams: { countryId: this.country?.id } });
  }
  goToAddOwner() {
    this.router.navigate(['/admin/add-country-owner'], { queryParams: { countryId: this.country?.id } });
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
  goToAssignCountryToOwner() {
    this.router.navigate(['/admin/assign-country-to-owner'], { queryParams: { countryId: this.country?.id } });
  }

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
    this.router.navigate(['/map-guards'], { queryParams: { countryId: this.country?.id } });
  }

  goToAmenities() {
    this.router.navigate(['/admin/view-all-amenities'], { queryParams: { countryId: this.country?.id } });
  }
  goToEventsHistorial() {
    this.router.navigate(['/admin/events-historial'], { queryParams: { countryId: this.country?.id } });
  }
}
