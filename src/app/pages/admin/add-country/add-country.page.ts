import { AfterViewInit, Component, OnInit } from '@angular/core';
import 'leaflet/dist/leaflet.css';

import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CountriesService } from 'src/app/services/countries/countries.service';

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

  public newImg: any = "https://ionicframework.com/docs/img/demos/card-media.png";

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

  constructor(private _countries: CountriesService, protected _formBuilder: FormBuilder, protected _alertService: AlertService, private http: HttpClient, private _router: Router) { 
    this.formBuilder = _formBuilder;
      this.form = this.createForm();
      this.data = {  
        countryName: ''       
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      countryName: ['', [Validators.required, Validators.minLength(3)]],
      countryAvatar: new FormControl('', [Validators.required]),
      fileSource: new FormControl('', [Validators.required])
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

  onFileChange(event) {


    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => this.newImg = reader.result;
    
    reader.readAsDataURL(file);

    if (event.target.files.length > 0) {

      
      const file = event.target.files[0];
      this.form.patchValue({
        fileSource: file
      });
    }
  }

  protected addCountry(): void{
    this.setCoords();
    this._countries.addCountry(this.getForm().get('fileSource').value, this.getForm().value.countryName, this.lat, this.lng);
  }

  public getForm(): FormGroup {
    return this.form;
  }

}
