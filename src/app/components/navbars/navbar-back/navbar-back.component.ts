import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-navbar-back',
    templateUrl: './navbar-back.component.html',
    styleUrls: ['./navbar-back.component.scss'],
    standalone: true,
})
export class NavbarBackComponent implements OnInit {

  @Input('title') title: string;

  constructor() { }

  ngOnInit() { }

  public getTitle(): string {
    return this.title;
  }

  private setTitle(title: string): void {
    this.title = title;
  }

}
