import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss'],
    standalone: true
})
export class Tab2Page implements OnInit{

  @ViewChild('maps') maps

  constructor() {

  }
  ngOnInit(): void {
    
  }
  ionViewWillEnter() {
    this.maps.ionViewWillEnter()
  }

}
