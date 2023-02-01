import { Component, Input, OnInit } from '@angular/core';
import { RecurrentsInterface } from 'src/app/interfaces/recurrents-interface';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { RecurrentsService } from 'src/app/services/recurrents/recurrents.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';

@Component({
  selector: 'app-recurrents-view-all',
  templateUrl: './recurrents-view-all.component.html',
  styleUrls: ['./recurrents-view-all.component.scss'],
  providers: [SortPipe]
})
export class RecurrentsViewAllComponent implements OnInit {
  @Input('role') role;
  @Input('readOnly') readOnly;
   recurrents: any[]

  constructor(private _recurrentsService: RecurrentsService, private _ownerStorage: OwnerStorageService) { }

  async ngOnInit() {
    if(this.role == 'owner') {
      const id_property = await (await this._ownerStorage.getOwner()).property.id
      this._recurrentsService.getByPropertyID(id_property).subscribe(
        recurrents =>{
          this.recurrents = recurrents
          console.log("DESDE EL OWNER");
        }
      )
    } else {
      
      (await this._recurrentsService.getRecurrentsByCountry()).subscribe(
        recurrents => {
          this.recurrents = recurrents
          console.log(recurrents);
        }
      )

    }

    console.log(this.role);
    console.log(this.readOnly);

    // this._recurrentsService.getRecurrentsByCountry().then(data => data.subscribe((recurrents) =>{
    //   this.recurrents = recurrents
    //   console.log(recurrents); 
    // }))
    // console.log("oNiNIT desde componente");  
  }

  public cambiarStatus(recurrent, i) {
    this._recurrentsService.patchStatus(recurrent.id, recurrent.status).subscribe(data => {
      console.log(data)
      this.recurrents[i].status = !recurrent.status;
    })
    //recurrent.status = !recurrent.status
  }


}
