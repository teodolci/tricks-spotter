import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { environment } from 'src/environments/environment';

//Pattern of the paginated datas
type Paginated<T = unknown> = {
  data: T[],
  page: number,
  pageSize: number,
  total: number;
}

declare type User = {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
};

declare type Trick = {
  _id: string;
  name: string;
  video: string;
  userId: string;
  spotId: string;
  spotName: string;
  userName: string;
  categories: [string];
};

declare type Spot = {
  _id: string;
  name: string;
  description: string;
  category: string[];
  geolocation: number[];
  picture: string;
  creationDate: Date;
};

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss']
})
export class ProfilPage implements OnInit {
  user: User
  spot: any
  userTrick: any

  constructor(
    private auth: AuthService,
    private router: Router,
    public http: HttpClient,
  ) { }

  public tricks = []
  public pageCounter = 1
  public everythingLoaded = false
  ngOnInit() {
    //Retrieve the infos of the user connected
    this.auth.getUser$()
      .subscribe(userData => {
        this.user = userData
      });

    //Retrieve all the tricks of the user connected
    this.getTricksPage(this.pageCounter)
  }

  getTricksPage(page: number) {
    const urlTricks = `${environment.apiUrl}/users/${this.user._id}/tricks?page=${page}`;
    const urlSpot = `${environment.apiUrl}/spots`;
    const urlUser = `${environment.apiUrl}/users`;

    this.http.get<Paginated<Trick>>(urlTricks).subscribe((tricks) => {
      tricks.data.forEach(trick => {
        //Get the spot name
        this.http.get(`${urlSpot}/${trick.spotId}`).subscribe((spot) => {
          this.spot = spot
          trick.categories = this.spot.category
          trick.spotName = this.spot.name
        });
        //Get the user name
        this.http.get(`${urlUser}/${trick.userId}`).subscribe((user) => {
          this.userTrick = user
          trick.userName = this.user.userName
        });
        this.tricks.push(trick)
      });
      //Check if everything is loaded
      if(tricks.page * tricks.pageSize >= tricks.total) this.everythingLoaded = true
    });


  }

  deleteTrick(event:any) {
    const id = event.srcElement.attributes.id.nodeValue
    const urlTricks = `${environment.apiUrl}/tricks/${id}`;
    this.http.delete(urlTricks).subscribe({
      next: (res) => {
        const index = this.tricks.indexOf(res)
        this.tricks.splice(index, 1)
        window.location.reload()
        console.warn("Tricks deleted")
      },
      error: (err) => {
        console.warn(`Trick delete failed: ${err.message}`);
      },
    });
  }

  modifyTrick(event:any) {
    
  }

  loadMore() {
    this.pageCounter++
    this.getTricksPage(this.pageCounter)
    console.log("more")
  }

  logOut() {
    console.log("logging out...");
    this.auth.logOut();
    this.router.navigateByUrl("/login");
  }
}
