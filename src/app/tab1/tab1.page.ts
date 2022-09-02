import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  private loading: boolean;




  constructor(private menu: MenuController) { 
    this.setLoading(true);
    this.getData();
  }

  protected doRefresh(event){
    console.log(event);
  }

  private getData(){
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  openFirst(id: string) {
    this.menu.enable(true, id);
    this.menu.open(id);
  }

  openEnd() {
    this.menu.open('end');
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
  }
}
