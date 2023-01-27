import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddspotPage } from './addspot.page';

const routes: Routes = [
  {
    path: '',
    component: AddspotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddspotPageRoutingModule {}
