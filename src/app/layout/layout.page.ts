import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user';

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
  user: User
  constructor(private auth: AuthService,) {
    this.auth.getUser$()
      .subscribe(userData => {
        this.user = userData
      });

    this.tabs = [
      { title: "Ajout Tricks", icon: "add", path: "addtrick" },
      { title: "Spots", icon: "location-outline", path: "geoloc" },
      { title: "Mon compte", icon: "person-outline", path: "profil" },
    ];
    if(this.user.admin)this.tabs.unshift({title: "Ajout Spots", icon: "add", path: "addspot"})
  }
}
