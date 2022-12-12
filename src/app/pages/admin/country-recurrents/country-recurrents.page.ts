import { Component, OnInit } from '@angular/core';
import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';
import { RecurrentsInterface } from '../../../interfaces/recurrents-interface';

@Component({
  selector: 'app-country-recurrents',
  templateUrl: './country-recurrents.page.html',
  styleUrls: ['./country-recurrents.page.scss'],
})
export class CountryRecurrentsPage implements OnInit {
  recurrents: RecurrentsInterface[]

  constructor(private _recurrentsService: RecurrentsService) { }

  ngOnInit() {
    this._recurrentsService.getAll().subscribe(recurrents => this.recurrents = recurrents)
  }
  
  public cambiarStatus(recurrent, i){
    this._recurrentsService.patchStatus(recurrent.id, recurrent.status).subscribe(data => {console.log(data)
      this.recurrents[i].status = !recurrent.status;
                                                                                          })
    //recurrent.status = !recurrent.status
    }
}
