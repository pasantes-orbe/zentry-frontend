import { Component, OnInit } from '@angular/core';
import { GuardsService } from '../../../../services/guards/guards.service';
import { GuardInterface } from '../../../../interfaces/guard-interface';

@Component({
  selector: 'app-all-guards',
  templateUrl: './all-guards.page.html',
  styleUrls: ['./all-guards.page.scss'],
})
export class AllGuardsPage implements OnInit {
  protected guards: GuardInterface[]

  constructor(private _guardsService: GuardsService ) { }

  ngOnInit() {
    this._guardsService.getAllByCountryID().then(data => data.subscribe((guards) => {
      const actualDate = new Date();
      this.guards = this.filterByDay(guards, actualDate.getDay())
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
