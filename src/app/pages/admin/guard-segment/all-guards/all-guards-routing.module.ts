import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllGuardsPage } from './all-guards.page';

const routes: Routes = [
  {
    path: '',
    component: AllGuardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllGuardsPageRoutingModule {}
