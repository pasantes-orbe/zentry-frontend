import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  constructor(private oneSignal: OneSignal) { }

  initialConfiguration(){


    this.oneSignal.startInit('df4ae4bb-9ade-4eba-9d09-06da4069a8c7', '66515318403')


    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert)


    this.oneSignal.handleNotificationReceived().subscribe((noti) => {

      console.log("Notificacion Recibida", noti );
    })


    this.oneSignal.handleNotificationOpened().subscribe((noti) => {
      console.log("Notificacion Abierta", noti);
    })



    this.oneSignal.endInit();

  }

}


