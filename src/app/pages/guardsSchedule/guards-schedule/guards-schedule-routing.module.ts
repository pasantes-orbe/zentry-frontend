import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuardsSchedulePage } from './guards-schedule.page';

const routes: Routes = [
  {
    path: '',
    component: GuardsSchedulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuardsSchedulePageRoutingModule {}
