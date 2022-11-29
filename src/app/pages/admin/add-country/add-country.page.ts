import { AfterViewInit, Component, OnInit } from '@angular/core';
import 'leaflet/dist/leaflet.css';

import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { HttpClient } from '@angular/common/http';

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

  constructor(protected _formBuilder: FormBuilder, protected _alertService: AlertService, private http: HttpClient) { 
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
    if (event.target.files.length > 0) {

      
      const file = event.target.files[0];
      this.form.patchValue({
        fileSource: file
      });
    }
  }

  protected addCountry(){
    this.setCoords();


    console.log(this.getForm().value.countryName);
    console.log(this.lat, this.lng);


    const formData = new FormData();
    formData.append('avatar', this.form.get('fileSource').value);
    formData.append('name', this.getForm().value.countryName);
    formData.append('latitude', this.lat);
    formData.append('longitude', this.lng);

    this._alertService.setLoading();

    this.http.post('http://localhost:3000/api/countries', formData)
      .subscribe(res => {
        console.log(res);
        this._alertService.removeLoading();

        this._alertService.showAlert("¡Listo!", "El country se agregó con éxito")
      })

    // setTimeout(() => {
    //     this._alertService.removeLoading();

    //     this._alertService.showAlert("¡Listo!", "El country se agregó con éxito")

    // }, 2000);

  }

  public getForm(): FormGroup {
    return this.form;
  }

}
