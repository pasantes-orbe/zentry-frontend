import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { CountryMapComponent } from '../components/maps/country-map/country-map.component';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    CountryMapComponent
  ]
})
export class Tab2Page implements OnInit {
  public idCountryForMap: number | null = null;

  constructor(private ownerStorage: OwnerStorageService) {}

  async ngOnInit(): Promise<void> {
    try {
      const owner = await this.ownerStorage.getOwner();
      console.log('[Tab2] Owner:', owner);

      if (owner?.property?.id_country) {
        this.idCountryForMap = owner.property.id_country;
        console.log('[Tab2] idCountryForMap =', this.idCountryForMap);
      } else {
        console.warn('[Tab2] owner.property.id_country inexistente');
      }
    } catch (error) {
      console.error('Error al cargar datos del propietario:', error);
    }
  }
}