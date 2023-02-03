import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {

  constructor(
    private _router: Router
  ) { }

  public redirectByRole(role: string){

    var getUrl = window.location;
    var baseUrl = getUrl .protocol + "//" + getUrl.host;
    
    //TODO: VER SI FUNCIONA BIEN EN EL APK
    window.location.href = `${getUrl .protocol + "//" + getUrl.host}/menu/home`;


    if(role == "propietario") window.location.href = `${getUrl .protocol + "//" + getUrl.host}/home`;
    if(role == "vigilador") window.location.href = `${getUrl .protocol + "//" + getUrl.host}/vigiladores/home`; 
    if(role == "administrador") window.location.href = `${getUrl .protocol + "//" + getUrl.host}/admin/home`;
  }
}
