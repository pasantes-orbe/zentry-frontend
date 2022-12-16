import { Component, OnInit } from '@angular/core';
import { PasswordRecoverInterface } from 'src/app/interfaces/Password-requests-interface';
import { PasswordRecoverService } from '../../../../services/auth/password-recover.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-password-requests',
  templateUrl: './password-requests.page.html',
  styleUrls: ['./password-requests.page.scss'],
})
export class PasswordRequestsPage implements OnInit {
  
  protected requests: PasswordRecoverInterface[]
  protected loading;
  constructor(private _passwordRecoveryService: PasswordRecoverService, private loadingCtrl: LoadingController, private toastController: ToastController ) { }

  
  ngOnInit() {
    this._passwordRecoveryService.pendientsPasswordRequests().subscribe((requests) => {this.requests = requests})
  }

  public async resolverPeticion(id){
    const loading = await this.loadingCtrl.create({
      message: 'Enviando contraseña al usuario',
    });
    const toast = await this.toastController.create({
      message: 'Contraseña reestablecida exitosamente!',
      duration: 3000
    })

    loading.present();
    this._passwordRecoveryService.patchStatusRequest(id).then(data => data.subscribe((res) => {console.log(res);
    this.loading = this.stopLoading();
    this._passwordRecoveryService.pendientsPasswordRequests().subscribe((requests) => {this.requests = requests})
    loading.dismiss()
    toast.present();
    }))
    
  }


  public isLoading(){
    return true
  }

  public stopLoading(){
    return false
  }
}
