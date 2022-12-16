import { Component, OnInit } from '@angular/core';
import { OwnersService } from '../../../../services/owners/owners.service';
import { OwnerResponse } from '../../../../interfaces/ownerResponse-interface';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  protected owners : OwnerResponse[];

  constructor(private _ownersService: OwnersService) { }

  ngOnInit() {
    this._ownersService.getAllByCountryID().then(data => data.subscribe( owners => this.owners = owners))
  }
  
  ionViewWillEnter(){
    this.ngOnInit()
  }
}
