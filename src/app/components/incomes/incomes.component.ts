import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/helpers/navigation.service';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss'],
})
export class IncomesComponent implements OnInit {

  @Input('readonly') readonly: boolean;
  @Input('nobuttons') nobuttons: boolean;

  private loading: boolean;
  private data: any;

  constructor(private Navigation: NavigationService) {
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

  public isNobuttons(): boolean {
    return this.nobuttons;
  }

  public setNobuttons(nobuttons: boolean): void {
    this.nobuttons = nobuttons;
  }


}
