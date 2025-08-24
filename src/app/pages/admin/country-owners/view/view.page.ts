import { Component, OnInit } from '@angular/core';
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
}