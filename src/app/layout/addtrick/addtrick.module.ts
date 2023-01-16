import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddtrickPageRoutingModule } from './addtrick-routing.module';

import { AddtrickPage } from './addtrick.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddtrickPageRoutingModule
  ],
  declarations: [AddtrickPage]
})
export class AddtrickPageModule {}
