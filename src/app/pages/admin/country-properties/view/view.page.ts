import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalController } from '@ionic/angular';

//Servicios
import { PropertiesService } from '../../../../services/properties/properties.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';

//Interfaces
import { Property_OwnerInterface } from 'src/app/interfaces/property_owner-interface';

//Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";
import { PropertyPage } from 'src/app/modals/properties/property/property.page';

// Interface para mock data
interface MockProperty {
  id: number;
  property: {
    id: number;
    name: string;
    address: string;
    type: string;
    rooms?: number;
    bathrooms?: number;
    size?: string;
    status: string;
  };
  owner: {
    id: number;
    user: {
      id: number;
      name: string;
      lastname: string;
      dni: string;
      email: string;
      phone: string;
      avatar: string;
    }
  };
}

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class ViewPage implements OnInit {

  public properties: MockProperty[] = [];
  public searchKey: string = '';
  public message = 'This modal example uses the modalController to present and dismiss modals.';

  constructor(
    private _propertiesService: PropertiesService,
    private modalCtrl: ModalController,
    private _authStorageService: AuthStorageService
  ) { }

  ngOnInit() {
    this.loadProperties();
  }

  ionViewWillEnter() {
    this.loadProperties();
  }

  async loadProperties() {
    try {
      // DATOS MOCK PARA LA DEMO
      this.properties = [
        {
          id: 1,
          property: {
            id: 1,
            name: 'Casa Jardín Norte',
            address: 'Av. Principal 123',
            type: 'Casa',
            rooms: 4,
            bathrooms: 3,
            size: '180m²',
            status: 'Ocupada'
          },
          owner: {
            id: 1,
            user: {
              id: 201,
              name: 'Juan',
              lastname: 'Pérez',
              dni: '12345678',
              email: 'juan.perez@email.com',
              phone: '3794123456',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 2,
          property: {
            id: 2,
            name: 'Depto Torre Azul',
            address: 'Calle Secundaria 456',
            type: 'Departamento',
            rooms: 2,
            bathrooms: 2,
            size: '95m²',
            status: 'Ocupada'
          },
          owner: {
            id: 2,
            user: {
              id: 202,
              name: 'María',
              lastname: 'González',
              dni: '23456789',
              email: 'maria.gonzalez@email.com',
              phone: '3794234567',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169313f?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 3,
          property: {
            id: 3,
            name: 'Villa Las Rosas',
            address: 'Pasaje Flores 789',
            type: 'Villa',
            rooms: 5,
            bathrooms: 4,
            size: '250m²',
            status: 'Ocupada'
          },
          owner: {
            id: 3,
            user: {
              id: 203,
              name: 'Carlos',
              lastname: 'Rodríguez',
              dni: '34567890',
              email: 'carlos.rodriguez@email.com',
              phone: '3794345678',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 4,
          property: {
            id: 4,
            name: 'Casa Moderna Plus',
            address: 'Boulevard Central 101',
            type: 'Casa',
            rooms: 3,
            bathrooms: 2,
            size: '150m²',
            status: 'Ocupada'
          },
          owner: {
            id: 4,
            user: {
              id: 204,
              name: 'Ana',
              lastname: 'Martínez',
              dni: '45678901',
              email: 'ana.martinez@email.com',
              phone: '3794456789',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 5,
          property: {
            id: 5,
            name: 'Loft Urbano Style',
            address: 'Av. Libertad 202',
            type: 'Loft',
            rooms: 1,
            bathrooms: 1,
            size: '75m²',
            status: 'Ocupada'
          },
          owner: {
            id: 5,
            user: {
              id: 205,
              name: 'Luis',
              lastname: 'Fernández',
              dni: '56789012',
              email: 'luis.fernandez@email.com',
              phone: '3794567890',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 6,
          property: {
            id: 6,
            name: 'Chalet Los Pinos',
            address: 'Calle Verde 303',
            type: 'Chalet',
            rooms: 4,
            bathrooms: 3,
            size: '200m²',
            status: 'Ocupada'
          },
          owner: {
            id: 6,
            user: {
              id: 206,
              name: 'Laura',
              lastname: 'Sánchez',
              dni: '67890123',
              email: 'laura.sanchez@email.com',
              phone: '3794678901',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 7,
          property: {
            id: 7,
            name: 'Casa Familiar Grande',
            address: 'Paseo Familia 404',
            type: 'Casa',
            rooms: 6,
            bathrooms: 4,
            size: '320m²',
            status: 'Ocupada'
          },
          owner: {
            id: 7,
            user: {
              id: 207,
              name: 'Pedro',
              lastname: 'Ramírez',
              dni: '78901234',
              email: 'pedro.ramirez@email.com',
              phone: '3794789012',
              avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 8,
          property: {
            id: 8,
            name: 'Estudio Compacto',
            address: 'Calle Corta 505',
            type: 'Estudio',
            rooms: 1,
            bathrooms: 1,
            size: '45m²',
            status: 'Ocupada'
          },
          owner: {
            id: 8,
            user: {
              id: 208,
              name: 'Carmen',
              lastname: 'Torres',
              dni: '89012345',
              email: 'carmen.torres@email.com',
              phone: '3794890123',
              avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 9,
          property: {
            id: 9,
            name: 'Duplex Vista Mar',
            address: 'Costera Norte 606',
            type: 'Duplex',
            rooms: 3,
            bathrooms: 3,
            size: '140m²',
            status: 'Ocupada'
          },
          owner: {
            id: 9,
            user: {
              id: 209,
              name: 'Miguel',
              lastname: 'Vargas',
              dni: '90123456',
              email: 'miguel.vargas@email.com',
              phone: '3794901234',
              avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 10,
          property: {
            id: 10,
            name: 'Casa Colonial',
            address: 'Calle Historia 707',
            type: 'Casa',
            rooms: 5,
            bathrooms: 3,
            size: '220m²',
            status: 'Ocupada'
          },
          owner: {
            id: 10,
            user: {
              id: 210,
              name: 'Isabel',
              lastname: 'Herrera',
              dni: '01234567',
              email: 'isabel.herrera@email.com',
              phone: '3794012345',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 11,
          property: {
            id: 11,
            name: 'Penthouse Elite',
            address: 'Torre Premium 808',
            type: 'Penthouse',
            rooms: 4,
            bathrooms: 4,
            size: '300m²',
            status: 'Ocupada'
          },
          owner: {
            id: 11,
            user: {
              id: 211,
              name: 'Roberto',
              lastname: 'Jiménez',
              dni: '11223344',
              email: 'roberto.jimenez@email.com',
              phone: '3794112233',
              avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 12,
          property: {
            id: 12,
            name: 'Casa Esquina Sol',
            address: 'Av. Sol y Luna 909',
            type: 'Casa',
            rooms: 3,
            bathrooms: 2,
            size: '160m²',
            status: 'Ocupada'
          },
          owner: {
            id: 12,
            user: {
              id: 212,
              name: 'Patricia',
              lastname: 'Morales',
              dni: '22334455',
              email: 'patricia.morales@email.com',
              phone: '3794223344',
              avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 13,
          property: {
            id: 13,
            name: 'Apartamento Centro',
            address: 'Plaza Central 110',
            type: 'Apartamento',
            rooms: 2,
            bathrooms: 2,
            size: '85m²',
            status: 'Ocupada'
          },
          owner: {
            id: 13,
            user: {
              id: 213,
              name: 'Francisco',
              lastname: 'Ruiz',
              dni: '33445566',
              email: 'francisco.ruiz@email.com',
              phone: '3794334455',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 14,
          property: {
            id: 14,
            name: 'Villa Residencial',
            address: 'Barrio Privado 220',
            type: 'Villa',
            rooms: 5,
            bathrooms: 4,
            size: '280m²',
            status: 'Ocupada'
          },
          owner: {
            id: 14,
            user: {
              id: 214,
              name: 'Elena',
              lastname: 'Castro',
              dni: '44556677',
              email: 'elena.castro@email.com',
              phone: '3794445566',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169313f?w=150&h=150&fit=crop&crop=face'
            }
          }
        },
        {
          id: 15,
          property: {
            id: 15,
            name: 'Casa Quinta Bella',
            address: 'Camino Quinta 330',
            type: 'Quinta',
            rooms: 4,
            bathrooms: 3,
            size: '350m²',
            status: 'Ocupada'
          },
          owner: {
            id: 15,
            user: {
              id: 215,
              name: 'Andrés',
              lastname: 'Ortega',
              dni: '55667788',
              email: 'andres.ortega@email.com',
              phone: '3794556677',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            }
          }
        }
      ];

      console.log('Propiedades cargadas para demo:', this.properties.length);

      // Código original comentado
      /*
      const propertiesObservable = await this._propertiesService.getAllProperty_OwnerByCountryID();
      propertiesObservable.subscribe((property) => {
        this.properties = property;
        console.log(property);
      });
      */
    } catch (error) {
      console.error("Error al cargar las propiedades:", error);
    }
  }

  async editProperty(id: any, index: number) {
    console.log('Editando propiedad con ID (DEMO):', id);

    const modal = await this.modalCtrl.create({
      component: PropertyPage,
      componentProps: {
        property_id: id
      }
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
      this.loadProperties();
    }
  }

  async deleteProperty(id: number, index: number) {
    try {
      // Para la demo, eliminar localmente
      this.properties.splice(index, 1);
      console.log('Propiedad eliminada de la demo:', id);

      // Código original comentado
      /*
      const token = await this._authStorageService.getJWT();
      this._propertiesService.deleteProperty(id, token).subscribe(
        res => {
          console.log(res);
          this.properties.splice(index, 1);
        }
      );
      */
    } catch (error) {
      console.error("Error al eliminar la propiedad:", error);
    }
  }

  // Getter para propiedades filtradas
  public get filteredProperties(): MockProperty[] {
    if (!this.searchKey || this.searchKey.trim() === '') {
      return this.properties;
    }

    const searchTerm = this.searchKey.toLowerCase().trim();
    return this.properties.filter(prop =>
      prop.property.name.toLowerCase().includes(searchTerm) ||
      prop.property.address.toLowerCase().includes(searchTerm) ||
      prop.property.type.toLowerCase().includes(searchTerm) ||
      prop.owner.user.name.toLowerCase().includes(searchTerm) ||
      prop.owner.user.lastname.toLowerCase().includes(searchTerm) ||
      prop.owner.user.dni.includes(searchTerm)
    );
  }

  // Métodos adicionales para la demo
  public getTotalPropertiesCount(): number {
    return this.properties.length;
  }

  public getPropertiesByType(type: string): MockProperty[] {
    return this.properties.filter(prop => 
      prop.property.type.toLowerCase() === type.toLowerCase()
    );
  }

  public getPropertyTypes(): string[] {
    const types = this.properties.map(prop => prop.property.type);
    return [...new Set(types)].sort();
  }

  // Método para manejar refresh
  public handleRefresh(event: any) {
    setTimeout(() => {
      this.loadProperties();
      event.target.complete();
    }, 1000);
  }

  public getOwnerAvatar(property: MockProperty): string {
    return property.owner.user.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }
}

/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalController } from '@ionic/angular';

//Servicios
import { PropertiesService } from '../../../../services/properties/properties.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';

//Interfaces
import { Property_OwnerInterface } from 'src/app/interfaces/property_owner-interface';

//Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";
import { PropertyPage } from 'src/app/modals/properties/property/property.page';


@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class ViewPage implements OnInit {

  // CORRECCIÓN: Propiedades cambiadas a 'public' para que el HTML pueda acceder a ellas.
  public properties: Property_OwnerInterface[] = [];
  public searchKey: string = '';
  public message = 'This modal example uses the modalController to present and dismiss modals.';

  constructor(
    private _propertiesService: PropertiesService,
    private modalCtrl: ModalController,
    private _authStorageService: AuthStorageService
  ) { }

  ngOnInit() {
    this.loadProperties();
  }

  ionViewWillEnter() {
    this.loadProperties();
  }

  async loadProperties() {
    try {
      const propertiesObservable = await this._propertiesService.getAllProperty_OwnerByCountryID();
      propertiesObservable.subscribe((property) => {
        this.properties = property;
        console.log(property);
      });
    } catch (error) {
      console.error("Error al cargar las propiedades:", error);
    }
  }

  // CORRECCIÓN: Se ajusta la firma de la función para que coincida con la llamada del HTML.
  // Ahora acepta dos argumentos, aunque solo usemos el primero.
  async editProperty(id: any, index: number) {
    console.log('Editando propiedad con ID:', id);

    const modal = await this.modalCtrl.create({
      component: PropertyPage,
      componentProps: {
        property_id: id
      }
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
      this.loadProperties(); // Recargamos las propiedades por si hubo cambios.
    }
  }

  async deleteProperty(id: number, index: number) {
    try {
      const token = await this._authStorageService.getJWT();
      // Se asume que el servicio devuelve un Observable.
      this._propertiesService.deleteProperty(id, token).subscribe(
        res => {
          console.log(res);
          this.properties.splice(index, 1);
        }
      );
    } catch (error) {
      console.error("Error al eliminar la propiedad:", error);
    }
  }
}*/