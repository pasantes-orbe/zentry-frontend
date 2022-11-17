import { AfterViewInit, Component, OnInit } from '@angular/core';
import 'leaflet/dist/leaflet.css';

import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';

@Component({
  selector: 'app-add-country',
  templateUrl: './add-country.page.html',
  styleUrls: ['./add-country.page.scss'],
})
export class AddCountryPage implements AfterViewInit {

  private map;
  public lat;
  public lng;
  public marker;

  public countryName: string;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  protected data;

  private initMap(): void {
    this.map = L.map('map', {
      center: [ -40.44, -63.59 ],
      zoom: 3
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize(true);
    }, 100);

    
  }

  constructor(protected _formBuilder: FormBuilder, protected _alertService: AlertService) { 
    this.formBuilder = _formBuilder;
      this.form = this.createForm();
      this.data = {  
        countryName: ''       
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      countryName: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngAfterViewInit(): void {
    this.initMap();

    this.map.attributionControl.setPrefix(false);

    const iconRetinaUrl = 'assets/marker-guard.webp';
    const iconUrl = 'assets/marker-guard.webp';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      iconSize: [35, 35],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    this.marker = new L.marker([ -40.44, -63.59 ], {
      draggable: 'true'
    });

    L.Marker.prototype.options.icon = iconDefault;

    

    this.map.addLayer(this.marker);

    this.marker.addEventListener('dragend', function(event) {
      let position = this.getLatLng();
      this.setLatLng(position, {
        draggable: 'true'
      }).bindPopup(position).update();
    });
  }

  setCoords(){
    const {lat, lng} = this.marker.getLatLng();
    this.lat = lat;
    this.lng = lng;
  }

  protected addCountry(){
    this.setCoords();

    console.log(this.getForm().value.countryName);
    console.log(this.lat, this.lng);

    this._alertService.setLoading();

    setTimeout(() => {
        this._alertService.removeLoading();

        this._alertService.showAlert("¡Listo!", "El country se agregó con éxito")

    }, 2000);

  }

  public getForm(): FormGroup {
    return this.form;
  }

}
