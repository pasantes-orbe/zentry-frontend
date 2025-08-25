import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

//Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

// Interface para mock data
interface MockOwner {
  id: number;
  user: {
    id: number;
    name: string;
    lastname: string;
    dni: string;
    email: string;
    phone: string;
    avatar: string;
    isActive: boolean;
  };
  property: {
    id: number;
    name: string;
    address: string;
    type: string;
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

  owners: MockOwner[] = [];
  searchKey: string = '';

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadOwners();
  }

  ionViewWillEnter() {
    this.loadOwners();
  }

  loadOwners() {
    // DATOS MOCK PARA LA DEMO
    this.owners = [
      {
        id: 1,
        user: {
          id: 201,
          name: 'Juan',
          lastname: 'Pérez',
          dni: '12345678',
          email: 'juan.perez@email.com',
          phone: '3794123456',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 1,
          name: 'Casa Jardín Norte',
          address: 'Av. Principal 123',
          type: 'Casa'
        }
      },
      {
        id: 2,
        user: {
          id: 202,
          name: 'María',
          lastname: 'González',
          dni: '23456789',
          email: 'maria.gonzalez@email.com',
          phone: '3794234567',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169313f?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 2,
          name: 'Depto Torre Azul',
          address: 'Calle Secundaria 456',
          type: 'Departamento'
        }
      },
      {
        id: 3,
        user: {
          id: 203,
          name: 'Carlos',
          lastname: 'Rodríguez',
          dni: '34567890',
          email: 'carlos.rodriguez@email.com',
          phone: '3794345678',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 3,
          name: 'Villa Las Rosas',
          address: 'Pasaje Flores 789',
          type: 'Villa'
        }
      },
      {
        id: 4,
        user: {
          id: 204,
          name: 'Ana',
          lastname: 'Martínez',
          dni: '45678901',
          email: 'ana.martinez@email.com',
          phone: '3794456789',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 4,
          name: 'Casa Moderna Plus',
          address: 'Boulevard Central 101',
          type: 'Casa'
        }
      },
      {
        id: 5,
        user: {
          id: 205,
          name: 'Luis',
          lastname: 'Fernández',
          dni: '56789012',
          email: 'luis.fernandez@email.com',
          phone: '3794567890',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 5,
          name: 'Loft Urbano Style',
          address: 'Av. Libertad 202',
          type: 'Loft'
        }
      },
      {
        id: 6,
        user: {
          id: 206,
          name: 'Laura',
          lastname: 'Sánchez',
          dni: '67890123',
          email: 'laura.sanchez@email.com',
          phone: '3794678901',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 6,
          name: 'Chalet Los Pinos',
          address: 'Calle Verde 303',
          type: 'Chalet'
        }
      },
      {
        id: 7,
        user: {
          id: 207,
          name: 'Pedro',
          lastname: 'Ramírez',
          dni: '78901234',
          email: 'pedro.ramirez@email.com',
          phone: '3794789012',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 7,
          name: 'Casa Familiar Grande',
          address: 'Paseo Familia 404',
          type: 'Casa'
        }
      },
      {
        id: 8,
        user: {
          id: 208,
          name: 'Carmen',
          lastname: 'Torres',
          dni: '89012345',
          email: 'carmen.torres@email.com',
          phone: '3794890123',
          avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 8,
          name: 'Estudio Compacto',
          address: 'Calle Corta 505',
          type: 'Estudio'
        }
      },
      {
        id: 9,
        user: {
          id: 209,
          name: 'Miguel',
          lastname: 'Vargas',
          dni: '90123456',
          email: 'miguel.vargas@email.com',
          phone: '3794901234',
          avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 9,
          name: 'Duplex Vista Mar',
          address: 'Costera Norte 606',
          type: 'Duplex'
        }
      },
      {
        id: 10,
        user: {
          id: 210,
          name: 'Isabel',
          lastname: 'Herrera',
          dni: '01234567',
          email: 'isabel.herrera@email.com',
          phone: '3794012345',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 10,
          name: 'Casa Colonial',
          address: 'Calle Historia 707',
          type: 'Casa'
        }
      },
      {
        id: 11,
        user: {
          id: 211,
          name: 'Roberto',
          lastname: 'Jiménez',
          dni: '11223344',
          email: 'roberto.jimenez@email.com',
          phone: '3794112233',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 11,
          name: 'Penthouse Elite',
          address: 'Torre Premium 808',
          type: 'Penthouse'
        }
      },
      {
        id: 12,
        user: {
          id: 212,
          name: 'Patricia',
          lastname: 'Morales',
          dni: '22334455',
          email: 'patricia.morales@email.com',
          phone: '3794223344',
          avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 12,
          name: 'Casa Esquina Sol',
          address: 'Av. Sol y Luna 909',
          type: 'Casa'
        }
      },
      {
        id: 13,
        user: {
          id: 213,
          name: 'Francisco',
          lastname: 'Ruiz',
          dni: '33445566',
          email: 'francisco.ruiz@email.com',
          phone: '3794334455',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 13,
          name: 'Apartamento Centro',
          address: 'Plaza Central 110',
          type: 'Apartamento'
        }
      },
      {
        id: 14,
        user: {
          id: 214,
          name: 'Elena',
          lastname: 'Castro',
          dni: '44556677',
          email: 'elena.castro@email.com',
          phone: '3794445566',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169313f?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 14,
          name: 'Villa Residencial',
          address: 'Barrio Privado 220',
          type: 'Villa'
        }
      },
      {
        id: 15,
        user: {
          id: 215,
          name: 'Andrés',
          lastname: 'Ortega',
          dni: '55667788',
          email: 'andres.ortega@email.com',
          phone: '3794556677',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isActive: true
        },
        property: {
          id: 15,
          name: 'Casa Quinta Bella',
          address: 'Camino Quinta 330',
          type: 'Quinta'
        }
      }
    ];

    console.log('Propietarios cargados para demo:', this.owners.length);
  }

  get sortedOwners() {
    if (!this.owners) return [];

    return this.owners.sort((a, b) => {
      const lastNameCompare = a.user.lastname.localeCompare(b.user.lastname);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.user.name.localeCompare(b.user.name);
    });
  }

  get filteredAndSortedOwners() {
    let filtered = this.sortedOwners;

    if (this.searchKey && this.searchKey.trim()) {
      const searchTerm = this.searchKey.toLowerCase().trim();
      filtered = filtered.filter(owner =>
        owner.user.lastname.toLowerCase().includes(searchTerm) ||
        owner.user.name.toLowerCase().includes(searchTerm) ||
        owner.user.dni.toString().includes(searchTerm) ||
        owner.property.name.toLowerCase().includes(searchTerm) ||
        owner.property.address.toLowerCase().includes(searchTerm) ||
        owner.property.type.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  public editUser(userId: number, index: number) {
    console.log('Editando usuario (DEMO):', userId);
    this.router.navigate(['/admin/editar-propietario', userId]);
  }

  // Métodos adicionales para la demo
  public getTotalOwnersCount(): number {
    return this.owners.length;
  }

  public getActiveOwnersCount(): number {
    return this.owners.filter(owner => owner.user.isActive).length;
  }

  public getOwnersByPropertyType(type: string): MockOwner[] {
    return this.owners.filter(owner => 
      owner.property.type.toLowerCase() === type.toLowerCase()
    );
  }

  public getPropertyTypes(): string[] {
    const types = this.owners.map(owner => owner.property.type);
    return [...new Set(types)].sort();
  }

  // Método para manejar refresh
  public handleRefresh(event: any) {
    setTimeout(() => {
      this.loadOwners();
      event.target.complete();
    }, 1000);
  }

  // Método para obtener avatar con fallback
  public getOwnerAvatar(owner: MockOwner): string {
    return owner.user.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }
}

/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

//Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe'; // ajusta la ruta según tu estructura

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

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

  owners: any[] = [];
  searchKey: string = '';

  constructor(
    private router: Router,
    // Agrega aquí tus servicios necesarios
  ) { }

  ngOnInit() {
    this.loadOwners();
  }

  // Método para cargar propietarios
  loadOwners() {
    // Implementa aquí la lógica para cargar los propietarios
    // Por ejemplo, llamada a un servicio
  }

  // Getter para obtener propietarios ordenados
  get sortedOwners() {
    if (!this.owners) return [];

    return this.owners.sort((a, b) => {
      // Ordenar por apellido, luego por nombre
      const lastNameCompare = a.user.lastname.localeCompare(b.user.lastname);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.user.name.localeCompare(b.user.name);
    });
  }

  // Getter para propietarios filtrados y ordenados
  get filteredAndSortedOwners() {
    let filtered = this.sortedOwners;

    if (this.searchKey && this.searchKey.trim()) {
      const searchTerm = this.searchKey.toLowerCase().trim();
      filtered = filtered.filter(owner =>
        owner.user.lastname.toLowerCase().includes(searchTerm) ||
        owner.user.name.toLowerCase().includes(searchTerm) ||
        owner.user.dni.toString().includes(searchTerm) ||
        owner.property.name.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  // Método para editar usuario (debe ser público para acceso desde template)
  public editUser(userId: number, index: number) {
    this.router.navigate(['/admin/editar-propietario', userId]);
  }
}*/