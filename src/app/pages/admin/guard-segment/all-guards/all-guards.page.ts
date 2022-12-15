import { Component, OnInit } from '@angular/core';
import { GuardsService } from '../../../../services/guards/guards.service';
import { GuardInterface } from '../../../../interfaces/guard-interface';

@Component({
  selector: 'app-all-guards',
  templateUrl: './all-guards.page.html',
  styleUrls: ['./all-guards.page.scss'],
})
export class AllGuardsPage implements OnInit {
  protected guards: GuardInterface[]

  constructor(private _guardsService: GuardsService ) { }

  ngOnInit() {
    this._guardsService.getAll().subscribe(guards => this.guards = guards)
  }


}
