import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss'],
})
export class IncomesComponent implements OnInit {

  @Input('readonly') readonly: boolean;


  private loading: boolean;
  private data: any;



  constructor() {
    this.setLoading(true);
    this.loadData();
  }

  ngOnInit() { }

  private loadData(): void {
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  public getData(): any {
    return this.data;
  }

  private setData(data: any): void {
    this.data = data;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;
  }

  public isReadOnly(): boolean {
    return this.readonly;
  }

  private setReadOnly(readonly: boolean): void {
    this.readonly = readonly;
  }


}
