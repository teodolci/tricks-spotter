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
        redirectTo: "accueil",
        pathMatch: "full",
      },
      {
        // Route pour le login
        path: 'login',
        loadChildren: () => import('../auth/login/login.module').then(m => m.LoginPageModule)
      },
      {
        // Route pour le signup
        path: 'signup',
        loadChildren: () => import('../auth/signup/signup.module').then(m => m.SignupPageModule)
      },
      {
        // Route pour la page d'accueil
        path: 'accueil',
        loadChildren: () => import('./accueil/accueil.module').then(m => m.AccueilPageModule)
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
