import { Component, OnInit, ViewChild } from '@angular/core';
import { RecurrentsViewAllComponent } from 'src/app/components/recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';
import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';
import { RecurrentsInterface } from '../../../interfaces/recurrents-interface';

@Component({
  selector: 'app-country-recurrents',
  templateUrl: './country-recurrents.page.html',
  styleUrls: ['./country-recurrents.page.scss'],
})
export class CountryRecurrentsPage implements OnInit {
  protected recurrents: RecurrentsInterface[]

  @ViewChild('recurrents') recurrentsComponent: RecurrentsViewAllComponent;

  constructor(private _recurrentsService: RecurrentsService) { }

  ngOnInit() {
    this._recurrentsService.getRecurrentsByCountry().then(data => data.subscribe((recurrents) => this.recurrents = recurrents))
  }

  async ionViewWillEnter(){
    this.ngOnInit()
    console.log("sss");
    await this.recurrentsComponent.ngOnInit()
  }
  
  public cambiarStatus(recurrent, i){
    this._recurrentsService.patchStatus(recurrent.id, recurrent.status).subscribe(data => {
      console.log(data)
      this.recurrents[i].status = !recurrent.status;                                                       
    })
    //recurrent.status = !recurrent.status
    }
}
