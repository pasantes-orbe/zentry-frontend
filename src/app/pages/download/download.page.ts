import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-download',
  templateUrl: './download.page.html',
  styleUrls: ['./download.page.scss'],
})
export class DownloadPage implements OnInit {

  deferredPrompt;
  constructor() { }

  showInstallButton = false;

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      event.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = event;
      // Update UI to notify the user they can add to home screen
      this.showInstallButton = true;
    });
  }

  promptInstallPWA() {
    if (this.deferredPrompt) {
      // Show the prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Reset the deferred prompt variable
        this.deferredPrompt = null;
        // Hide the install button
        this.showInstallButton = false;
      });
    }
  }

  // showInstallBanner() {
  //   if (this.deferredPrompt !== undefined && this.deferredPrompt !== null) {
  //     // Show the prompt
  //     this.deferredPrompt.prompt()
  //     // Wait for the user to respond to the prompt
  //     this.deferredPrompt.userChoice
  //       .then((choiceResult) => {
  //         if (choiceResult.outcome === 'accepted') {
  //           console.log('User accepted the A2HS prompt');
  //         } else {
  //           console.log('User dismissed the A2HS prompt');
  //         }
  //         // We no longer need the prompt.  Clear it up.
  //         this.deferredPrompt = null
  //       })
  //   }
  // }
  // createDirectAccess(){
  //   if (window.matchMedia('(display-mode: standalone)').matches) {
  //       // Si ya está instalada como una aplicación independiente, ocultar el botón
  //       document.getElementById('crearAccesoDirecto').style.display = 'none';
  //     } else {
  //       // Agregar el evento click al botón
  //       document.getElementById('crearAccesoDirecto').addEventListener('click', function() {
  //         // Verificar si el navegador admite la API de instalación de aplicaciones web
  //         if ('getInstalledRelatedApps' in navigator) {
  //           navigator.getInstalledRelatedApps().then(function(apps) {
  //             // Verificar si la aplicación ya está instalada desde la tienda
  //             if (apps.length === 0) {
  //               // Mostrar el banner de instalación
  //               var bannerPrompt = window.matchMedia('(display-mode: browser)').matches ? null : { prompt() {} };
  //               window.addEventListener('beforeinstallprompt', function(event) {
  //                 event.userChoice.then(function(choiceResult) {
  //                   // Registrar la elección del usuario (instalar o no)
  //                 });
  //               });
  //               // Mostrar el banner de instalación
  //               window.promptForInstall = function() {
  //                 bannerPrompt.prompt();
  //               };
  //             } else {
  //               alert('La aplicación ya está instalada.');
  //             }
  //           });
  //         } else {
  //           alert('El navegador no admite la instalación de aplicaciones web.');
  //         }
  //       });
  //     }
  // }
}
