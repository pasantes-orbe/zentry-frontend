import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-navbar-guards',
  templateUrl: './navbar-guards.component.html',
  styleUrls: ['./navbar-guards.component.scss'],
})
export class NavbarGuardsComponent implements OnInit {

  constructor(
    private router: Router, 
    private menu: MenuController
    ) { }

  ngOnInit() {}

  protected navigate(url: string): void {
    this.router.navigate([url]);
  }

  protected openFirst(id: string): void {
    this.menu.enable(true, id);
    this.menu.open(id);
  }

}
