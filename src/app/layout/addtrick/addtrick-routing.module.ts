import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddtrickPage } from './addtrick.page';

const routes: Routes = [
  {
    path: '',
    component: AddtrickPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddtrickPageRoutingModule {}
