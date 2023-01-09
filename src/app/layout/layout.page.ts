import { Component } from '@angular/core';

declare type PageTab = {
  title: string; // The title of the tab in the tab bar
  icon: string; // The icon of the tab in the tab bar
  path: string; // The route's path of the tab to display
};

@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
})
export class LayoutPage {
  tabs: PageTab[];

  constructor() {
    this.tabs = [
      { title: "Acceuil", icon: "home-outline", path: "accueil" },
      { title: "Géolocalisation", icon: "location-outline", path: "geoloc" },
      { title: "Mon compte", icon: "person-outline", path: "profil" },
    ];
  }
}
