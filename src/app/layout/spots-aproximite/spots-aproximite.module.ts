import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SpotsAProximitePageRoutingModule } from './spots-aproximite-routing.module';

import { SpotsAProximitePage } from './spots-aproximite.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpotsAProximitePageRoutingModule
  ],
  declarations: [SpotsAProximitePage]
})
export class SpotsAProximitePageModule {}
