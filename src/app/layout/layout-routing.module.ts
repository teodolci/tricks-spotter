import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutPage } from './layout.page';

const routes: Routes = [
  {
    // Route par défaut
    path: '',
    component: LayoutPage,
    children: [
      {
        path: "",
        redirectTo: "geoloc",
        pathMatch: "full",
      },
      {
        path: 'addtrick',
        loadChildren: () => import('./addtrick/addtrick.module').then( m => m.AddtrickPageModule)
      },
      {
        // Route pour la page de géolocalisation
        path: 'geoloc',
        loadChildren: () => import('./geoloc/geoloc.module').then(m => m.GeolocPageModule)
      },
      {
        // Route pour la page de profil
        path: 'profil',
        loadChildren: () => import('./profil/profil.module').then(m => m.ProfilPageModule)
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutPageRoutingModule { }
