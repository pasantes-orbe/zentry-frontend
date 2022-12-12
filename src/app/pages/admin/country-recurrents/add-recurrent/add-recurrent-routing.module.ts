import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddRecurrentPage } from './add-recurrent.page';

const routes: Routes = [
  {
    path: '',
    component: AddRecurrentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddRecurrentPageRoutingModule {}
