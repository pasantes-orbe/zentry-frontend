import { Component, OnInit } from '@angular/core';
import { GuardsService } from '../../../../services/guards/guards.service';
import { GuardInterface } from '../../../../interfaces/guard-interface';
import { AlertController, ModalController } from '@ionic/angular';
import { EditGuardPage } from 'src/app/modals/guards/edit-guard/edit-guard.page';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-all-guards',
  templateUrl: './all-guards.page.html',
  styleUrls: ['./all-guards.page.scss'],
})
export class AllGuardsPage implements OnInit {
  protected guards: GuardInterface[]
  protected guardsOut: GuardInterface[]
  public dropdownState: boolean = false;
  message = 'This modal example uses the modalController to present and dismiss modals.';

  constructor(private _guardsService: GuardsService, private modalCtrl: ModalController, private _userService: UserService, private alertCtrl: AlertController) { }

  ngOnInit() {
    this._guardsService.getAllByCountryID().then(data => data.subscribe((guards) => {
      console.log(guards);
      const actualDate = new Date();
      this.guards = this.filterByDay(guards, actualDate.getDay())
      this.guardsOut = this.fliterGuardsByAnotherDay(guards, actualDate.getDay())
    }
    ))
  }

  ionViewWillEnter(){
    this.ngOnInit()
  }

  handleRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.ngOnInit()
      event.target.complete();
    }, 2000);
  };

  async deleteGuard(userId){
    console.log(userId);
    
    const alerta = await this.alertCtrl.create({
      header: '¿Estás seguro de borrar este guardia?',
      message: 'El mismo no volverá a estar disponible.',
      buttons:[        
          {
            text: 'Confirmar',
            cssClass: 'red',
            role: 'confirm',
            handler: () => {
              this._userService.deleteUserById(userId).subscribe(res => {
                console.log(res);
                var getUrl = window.location;
                var baseUrl = getUrl .protocol + "//" + getUrl.host;
                window.location.href = `${getUrl .protocol + "//" + getUrl.host}/admin/todos-los-guardias`;
              })
            },
          }
          ],
    })

    alerta.present()

    
  }

  filterByDay(guards: GuardInterface[], weekDayNumber: number){
    const weekDay = this.returnDay(weekDayNumber)
    return guards.filter( guard => (guard.guard.week_day == weekDay && guard.guard.user.isActive !== false ))
  }

  fliterGuardsByAnotherDay(guards: GuardInterface[], weekDayNumber: number){
   const weekDay = this.returnDay(weekDayNumber)
   return guards.filter( guard => (guard.guard.week_day != weekDay && guard.guard.user.isActive !== false ))
  }

  public dropdown(){
   this.dropdownState = !this.dropdownState
 }
 

 async editGuard(id:any) {

  console.log(id);

  const modal = await this.modalCtrl.create({
    component: EditGuardPage,
    componentProps: {
      guard_id : id
    }
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm') {
    this.message = `Hello, ${data}!`;
  }
}


  public returnDay(weekday) {
    switch (weekday) {
       case 1:
          return "lunes";
       case 2:
          return "martes";
       case 3:
          return "miercoles";
       case 4:
          return "jueves";
       case 5:
          return "viernes";
       case 6:
          return "sabado";
       case 7:
          return "domingo";
       default:
          return "Fecha equivocada" ;
    }
 }
}
