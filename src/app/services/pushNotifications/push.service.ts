import { Injectable } from '@angular/core';

import OneSignal from 'onesignal-cordova-plugin';

import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  constructor(private _http: HttpClient) { }

 initialConfiguration() {

    // fab05c03-1276-4847-8414-1e858884aad9
    // 242297775895

    // var notificationOpenedCallback = function(jsonData) {
    //   console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    // };

    OneSignal.setAppId("df4ae4bb-9ade-4eba-9d09-06da4069a8c7");

    // window["plugins"].OneSignal
    // .startInit("df4ae4bb-9ade-4eba-9d09-06da4069a8c7")
    // .handleNotificationOpened(notificationOpenedCallback)
    // .inFocusDisplaying(window["plugins"].OneSignal.OSInFocusDisplayOption.Notification)
    // .endInit();

    OneSignal.setNotificationOpenedHandler(function (jsonData) {
       console.log('notificationOpenedCallback: ', jsonData);
     });
    

     OneSignal.getDeviceState((state) => {
      console.log(state);
     })
    // console.log(window["plugins"].OneSignal.handleNotificationOpened(notificationOpenedCallback));

    // Prompts the user for notification permissions.

    // window["plugins"].OneSignal.promptForPushNotificationsWithUserResponse(function(accepted) {
    //   console.log("User accepted notifications: " + accepted);
    // });
    
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
     OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
       console.log("User accepted notifications: " + accepted);
     });

  }

  setOneSignalID(id){

      OneSignal.setExternalUserId(id, (results) => {
      // The results will contain push and email success statuses
      console.log('Results of setting external user id');
      console.log(results);

  })


    }



    setTagToExternalId(id, role){

      this._http.put(`${environment.URL}/api/notifications/send_to_segment/${role}`, {
        external_user_id: id
      })

    }



}


