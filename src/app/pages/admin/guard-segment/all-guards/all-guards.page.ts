import { Component, OnInit } from '@angular/core';
import { GuardsService } from '../../../../services/guards/guards.service';
import { GuardInterface } from '../../../../interfaces/guard-interface';
import { ModalController } from '@ionic/angular';
import { EditGuardPage } from 'src/app/modals/guards/edit-guard/edit-guard.page';

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

  constructor(private _guardsService: GuardsService, private modalCtrl: ModalController ) { }

  ngOnInit() {
    this._guardsService.getAllByCountryID().then(data => data.subscribe((guards) => {
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

  filterByDay(guards: GuardInterface[], weekDayNumber: number){
    const weekDay = this.returnDay(weekDayNumber)
    return guards.filter( guard => guard.guard.week_day == weekDay)
  }

  fliterGuardsByAnotherDay(guards: GuardInterface[], weekDayNumber: number){
   const weekDay = this.returnDay(weekDayNumber)
   return guards.filter( guard => guard.guard.week_day != weekDay)
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
