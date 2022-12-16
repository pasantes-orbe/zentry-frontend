import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddLaboralSchedulePage } from './add-laboral-schedule.page';

const routes: Routes = [
  {
    path: '',
    component: AddLaboralSchedulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddLaboralSchedulePageRoutingModule {}
