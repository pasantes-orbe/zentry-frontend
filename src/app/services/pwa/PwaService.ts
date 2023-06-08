import { Injectable } from "@angular/core";
import { AlertController, Platform } from "@ionic/angular";
import { timer } from "rxjs";
import { take } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
  })
  export class PwaService {
    private promptEvent: any;
  
    constructor(
        private alertController: AlertController,
        private platform: Platform
    ) { }
  
    
  
    private openPromptComponent(mobileType: 'ios' | 'android') {
      timer(3000)
        .pipe(take(1))
        .subscribe(() => { }  );
    }
  }