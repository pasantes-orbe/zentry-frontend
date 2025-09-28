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
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { NotificationInterface } from 'src/app/interfaces/notification-interface';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

// Componentes
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';
import { NotificationsPopoverComponent } from 'src/app/components/notifications-popover/notifications-popover';

@Component({
  selector: 'app-country-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    NavbarAdminComponent,
    NotificationsPopoverComponent
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

  // Notificaciones
  notifications: NotificationInterface[] = [];
  unreadCount = 0;
  private userIdForNotifications: number = 1; // fallback

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
    public theme: ThemeService,
    private notificationsSvc: NotificationsService,
    private userStorage: UserStorageService
  ) {}

  async ngOnInit(): Promise<void> {
    // Tema por rol
    this.theme.init('admin');

    // Intentamos tomar el id de usuario real para notificaciones
    try {
      const user = await this.userStorage.getUser().catch(() => null as any);
      if (user?.id) this.userIdForNotifications = Number(user.id);
    } catch {}

    // Carga de country por ?id=... o desde storage/mock
    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      this.countriesSvc.getByID(+idParam).subscribe({
        next: (c) => {
          this.country = c as CountryInteface;
          this.countryStorage.saveCountry(this.country); // cache
          this.loading = false;
          this.loadNotifications();
        },
        error: async (err) => {
          console.error('No se pudo cargar el country por id:', err);
          await this.loadFromStorageOrMock();
          this.loadNotifications();
        }
      });
      return;
    }

    await this.loadFromStorageOrMock();
    this.loadNotifications();
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
  // Notificaciones
  // ==========================
  private loadNotifications(): void {
    this.notificationsSvc.getAllByUser(this.userIdForNotifications).subscribe({
      next: (list: any[]) => {
        this.notifications = (list || []) as NotificationInterface[];
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: (err) => {
        console.error('Error cargando notificaciones:', err);
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
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
  // Navegación
  // ==========================
  backToAdminHome() {
    this.router.navigate(['/admin/home']);
  }

  async logout(): Promise<void> {
    try {
      await this.userStorage.clearUser();
      await this.countryStorage.clearCountry();
    } catch (e) {
      console.warn('Error limpiando storage en logout:', e);
    } finally {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // Propiedades / Dueños
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
  goToAssignCountryToOwner(): void {
    this.router.navigate(['/admin/assign-country-to-owner'], { queryParams: { countryId: this.country?.id } });
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
    this.router.navigate(['/map-guards'], { queryParams: { countryId: this.country?.id } });
  }
  goToAddGuard() {
    this.router.navigate(['/admin/add-guard'], { queryParams: { countryId: this.country?.id } });
  }

  // Eventos / Amenities
  goToAmenities() {
    this.router.navigate(['/admin/view-all-amenities'], { queryParams: { countryId: this.country?.id } });
  }
  goToEventsHistorial() {
    this.router.navigate(['/admin/events-historial'], { queryParams: { countryId: this.country?.id } });
  }
}
