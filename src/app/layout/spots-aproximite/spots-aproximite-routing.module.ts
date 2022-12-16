import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpotsAProximitePage } from './spots-aproximite.page';

const routes: Routes = [
  {
    path: '',
    component: SpotsAProximitePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpotsAProximitePageRoutingModule {}
