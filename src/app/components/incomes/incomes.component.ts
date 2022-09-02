import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss'],
})
export class IncomesComponent implements OnInit {

  private loading: boolean;
  private data: any;



  constructor() {
    this.setLoading(true);
    this.loadData();
  }

  ngOnInit() { }

  private loadData(): void{
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  public getData(): any {
    return this.data;
  }

  public setData(data: any): void {
    this.data = data;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
  }


}
