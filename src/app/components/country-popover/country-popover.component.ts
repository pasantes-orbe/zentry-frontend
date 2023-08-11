import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-country-popover',
  templateUrl: './country-popover.component.html',
  styleUrls: ['./country-popover.component.scss'],
})
export class CountryPopoverComponent implements OnInit {

  @Input() country: any; // Ajusta el tipo de datos según tu estructura


  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  async deleteCountry() {
    // Aquí puedes implementar la lógica para eliminar el país
    // Por ejemplo, puedes llamar a un servicio para realizar la eliminación
    console.log('Eliminar país:', this.country);
    
    // Cierra el popover después de eliminar
    this.popoverController.dismiss();
  }


} 
