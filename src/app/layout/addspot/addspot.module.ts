import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddspotPageRoutingModule } from './addspot-routing.module';

import { AddspotPage } from './addspot.page';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddspotPageRoutingModule,
    LeafletModule
  ],
  declarations: [AddspotPage]
})
export class AddspotPageModule {}
