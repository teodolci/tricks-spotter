import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { environment } from 'src/environments/environment';

declare type User = {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
};

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage implements OnInit {
  user: User

  constructor(
    private auth: AuthService,
    private router: Router,
    public http: HttpClient,
  ) { }

  ngOnInit() {
    //Retrieve the infos of the user connected
    this.auth.getUser$()
      .subscribe(userData => {
        this.user = userData
      });

    //Retrieve all the tricks of the user connected
    const url = `${environment.apiUrl}/users/${this.user._id}/tricks`;
    this.http.get(url).subscribe((tricks) => {
      console.log(`Tricks loaded`, tricks);
    });
  }

  logOut() {
    console.log("logging out...");
    this.auth.logOut();
    this.router.navigateByUrl("/login");
  }
}
