import { Component, OnInit } from '@angular/core';
import { PasswordRecoverInterface } from 'src/app/interfaces/Password-requests-interface';
import { PasswordRecoverService } from '../../../../services/auth/password-recover.service';
import * as moment from 'moment';

@Component({
  selector: 'app-password-requests',
  templateUrl: './password-requests.page.html',
  styleUrls: ['./password-requests.page.scss'],
})
export class PasswordRequestsPage implements OnInit {
  src = ''
  protected requests: PasswordRecoverInterface[]
  protected loading: boolean
  constructor(private _passwordRecoveryService: PasswordRecoverService) { }

  ngOnInit() {
    this._passwordRecoveryService.pendientsPasswordRequests().subscribe((requests) => {this.requests = requests})
  }

  public resolverPeticion(id){
    this.loading = this.isLoading();
    this._passwordRecoveryService.patchStatusRequest(id).then(data => data.subscribe((res) => {console.log(res);
    this.loading = this.stopLoading();
    this._passwordRecoveryService.pendientsPasswordRequests().subscribe((requests) => {this.requests = requests})
    }))
    
  }

  public isLoading(){
    return true
  }

  public stopLoading(){
    return false
  }
}
