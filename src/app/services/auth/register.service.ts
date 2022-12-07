import { filter, map, first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../helpers/alert.service';
import { RolsService } from './rols.service';
import { Rols } from 'src/app/interfaces/rols-interface';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _rols: RolsService,) { }

  roles: Rols[] = [];

  public async register(name: string,
                        lastName: string,
                        dni: any,
                        email: any,
                        password: any,
                        phone: any,
                        birthdate: any,
                        avatar: File)
{
  console.log(name);
  console.log(lastName);
  console.log(dni);
  console.log(email);
  console.log(password);
  console.log(phone);
  console.log(birthdate);
  console.log(avatar);
  ;

  const resFiltered = this._rols.getRole().pipe(
    map( data =>
      data.filter(data => data.name == 'administrador')
    )
  );


}
}

//ownerName: ['', [Validators.required, Validators.minLength(3)]],
//ownerLastname:['', [Validators.required, Validators.minLength(5)]],
//ownerDNI:['', Validators.required],
//ownerEmail: ['', Validators.required],
//ownerPassword: ['', Validators.required],
//ownerPhone: ['', Validators.required],
//ownerBirthdate: ['', Validators.required],
//ownerAvatar: new FormControl('', [Validators.required]),
//fileSource: new FormControl('', [Validators.required])
