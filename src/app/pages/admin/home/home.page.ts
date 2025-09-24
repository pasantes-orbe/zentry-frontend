import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryInteface } from 'src/app/interfaces/country-interface'; // <- ojo al nombre
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { ThemeService } from 'src/app/services/theme/theme.service';

import { CountryPopoverComponent } from 'src/app/components/country-popover/country-popover.component';
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, NavbarAdminComponent, CountryPopoverComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  countries: CountryInteface[] = [];
  loading = false;
  unreadCount = 0;
  user: any = null;

  private notifSub?: Subscription;

  constructor(
    private countriesService: CountriesService,
    private countryStorage: CountryStorageService,
    private notificationsService: NotificationsService,
    private userStorage: UserStorageService,
    private popoverController: PopoverController,
    private router: Router,
    public theme: ThemeService
  ) {}

  async ngOnInit(): Promise<void> {
    this.theme.init('admin');

    try {
      this.user = await this.userStorage.getUser();
    } catch { this.user = null; }

    this.loadCountries();
    this.loadNotifications();

    try {
      this.notifSub = this.notificationsService.onNewNotification()?.subscribe(() => {
        this.unreadCount++;
      }) as Subscription;
    } catch {}
  }

  ngOnDestroy(): void {
    if (this.notifSub) this.notifSub.unsubscribe();
  }

  loadCountries(): void {
    this.loading = true;
    this.countriesService.getAll().subscribe({
      next: (list) => { this.countries = Array.isArray(list) ? list : []; this.loading = false; },
      error: (err) => { console.error('Error cargando countries:', err); this.countries = []; this.loading = false; }
    });
  }

  /* Navegación rápida (cards) */
  navigateToAddCountry() { this.router.navigate(['/admin/add-country']); }
  navigateToViewAllAmenities() { this.router.navigate(['/admin/view-all-amenities']); }
  navigateToAddOwner() { this.router.navigate(['/admin/add-country-owner']); }
  navigateToAssignCountryToOwner() { this.router.navigate(['/admin/assign-country-to-owner']); }
  navigateToMapGuards() { this.router.navigate(['/map-guards']); }
  navigateToAddProperty() { this.router.navigate(['/admin/add-property']); }
  navigateToOwners() { this.router.navigate(['/admin/view-owners']); }
  navigateToGuards() { this.router.navigate(['/admin/all-guards']); }
  navigateToReports() { this.router.navigate(['/admin/events-historial']); }

  // Abrir dashboard de un country concreto
  openCountryDashboard(c: CountryInteface): void {
    this.countryStorage.saveCountry(c);
    this.router.navigate(['/admin/country-dashboard', c.id]);
  }

  // Alias para que tu HTML actual (openCountry) no rompa
  openCountry(c: CountryInteface): void {
    this.openCountryDashboard(c);
  }

  async openPopover(country: CountryInteface, ev: Event) {
    const pop = await this.popoverController.create({
      component: CountryPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { country }
    });
    pop.onDidDismiss().then(res => {
      if (res?.data?.deleted || res?.data?.updated) this.loadCountries();
    });
    return pop.present();
  }

  loadNotifications(): void {
    this.notificationsService.getAllByUser(1).subscribe({
      next: (list: any[]) => {
        this.unreadCount = (list || []).filter(n => !n.read).length;
      },
      error: () => { this.unreadCount = 0; }
    });
  }

  async openNotificationsPopover(_ev: Event) {
    this.router.navigate(['/admin/events-historial']);
  }

  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? false;
    this.theme.set('admin', checked ? 'dark' : 'light');
  }

  getCountryImage(c: CountryInteface): string {
    return c.avatar || c.image || 'https://ionicframework.com/docs/img/demos/card-media.png';
  }
}
