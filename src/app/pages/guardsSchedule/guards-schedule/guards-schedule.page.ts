import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { GuardsService } from 'src/app/services/guards/guards.service';

@Component({
  selector: 'app-guards-schedule',
  templateUrl: './guards-schedule.page.html',
  styleUrls: ['./guards-schedule.page.scss'],
})
export class GuardsSchedulePage implements OnInit {

  guards: any[]



  constructor(private _guardsService: GuardsService) { }

  ngOnInit() {

    this._guardsService.getAllByCountryIdSinceOwner().then(data => data.subscribe((guards) => {
      
      console.log("antes", guards);
      guards.forEach(guard => {
        guard.guard.exit = moment.utc(guard.guard.exit).local().format("YYYY-MM-DDTHH:mm:ssZ") 
        guard.guard.start = moment.utc(guard.guard.start).local().format("YYYY-MM-DDTHH:mm:ssZ") 
      })



      console.log("guardias",guards);

      this.guards = guards

      // const map = res.map( x => {
      //   console.log("XSTART", x.start);
      //   return {
      //     exit: moment.utc(x.exit).local().format("YYYY-MM-DDTHH:mm:ssZ") ,
      //     id: x.id,
      //     start: moment.utc(x.start).local().format("YYYY-MM-DDTHH:mm:ssZ"),
      //     week_day: x.week_day
      //   }
      // })
      console.log(guards);
    }
    ))

  }

}
