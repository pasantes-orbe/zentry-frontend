import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { PushService } from './services/pushNotifications/push.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {
  constructor(
    private platform: Platform,
    private pushService: PushService
  ) {
    this.initializeApp();
  }

  initializeApp(){
    this.platform.ready().then(() =>{
      if (Capacitor.getPlatform() == 'android') {
        this.pushService.initialConfiguration()
      }
    })

  }

}
