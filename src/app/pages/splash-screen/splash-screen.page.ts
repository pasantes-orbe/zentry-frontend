import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RedirectService } from 'src/app/services/helpers/redirect.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
})
export class SplashScreenPage implements OnInit {

  constructor(
    private router: Router,
    private _userStorage: UserStorageService,
    private _redirectService: RedirectService
  ) { }

  ngOnInit() {
    this.ionViewWillEnter();
  }

  

  async ionViewWillEnter(){
    

    
    setTimeout(async () => {
      
      const user = await this._userStorage.getUser();
      // if(user){
      //   this._redirectService.redirectByRole(user['role'].name)
      // } else {
        this.router.navigate(["/login"]);
      // }

    }, 3000);

  }
  

}
