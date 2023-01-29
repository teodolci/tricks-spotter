import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { ToastController } from '@ionic/angular';

import { SignupRequest } from 'src/app/models/signup-request';

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
  categories: string[];
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

declare type modifUser = {
  firstName: string,
  lastName: string,
  userName: string
}

declare type TrickModif = {
  name: string;
  video: string;
}

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss']
})
export class ProfilPage implements OnInit {
  user: User
  spot: any
  userTrick: any

  modifRequest: TrickModif
  modifError: boolean;

  modifUserRequest: modifUser
  modifUserError: boolean

  constructor(
    private auth: AuthService,
    private router: Router,
    public http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.modifRequest = {
      name: "",
      video: ""
    }
    this.modifUserRequest = {
      firstName: "",
      lastName: "",
      userName: ""
    }
  }

  public tricks = []
  public pageCounter = 1
  public everythingLoaded = false
  ngOnInit() {
    //Retrieve the infos of the user connected
    this.auth.getUser$()
      .subscribe(userData => {
        this.user = userData
      });
    const userUrl = `${environment.apiUrl}/users/${this.user._id}`;
    this.http.get<User>(userUrl).subscribe((user) => {
      this.user = user
    })

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
      if (tricks.page * tricks.pageSize >= tricks.total) this.everythingLoaded = true
    });
  }

  //Delete a tricks
  async deleteTrick(event: any) {
    await this.presentAlert()

    if (this.roleMessage == "confirmer") { //Supprime le tricks
      console.log("supprimer le spot")
      const id = event.srcElement.attributes.id.nodeValue
      const urlTricks = `${environment.apiUrl}/tricks/${id}`;
      this.http.delete(urlTricks).subscribe({
        next: (res) => {
          console.log(res)
          console.log(this.tricks)
          const index = this.tricks.indexOf(res)
          this.tricks.splice(index, 1)
          window.location.reload()
          console.warn("Tricks deleted")
        },
        error: (err) => {
          console.warn(`Trick delete failed: ${err.message}`);
        },
      });
    } else { //Ne supprime pas le tricks
      console.log("annulé")
    }
  }

  //Modify a tricks
  public modifView = false
  public id = undefined
  modifyTrick(event: any) {
    this.modifView = true
    this.id = event.srcElement.attributes.id.nodeValue
    //Retrieve the infos of the trick to modify
    const trickUrl = `${environment.apiUrl}/tricks/${this.id}`
    this.http.get<Trick>(trickUrl).subscribe((trick) => {
      this.modifRequest = { name: trick.name, video: trick.video }
    })
  }

  toggleView() {
    this.modifView = !this.modifView
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

  //Manage the alert box
  handlerMessage = '';
  roleMessage = '';
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Vous allez supprimer un tricks!',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Annuler',
          role: 'annuler',
          handler: () => {
            this.handlerMessage = 'Annuler';
          },
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Supprimer',
          role: 'confirmer',
          handler: () => {
            this.handlerMessage = 'Confirmer';
          },
          cssClass: 'alert-button-confirm',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    this.roleMessage = `${role}`;
  }

  //Handle the submit to modify a trick
  onSubmit(form: NgForm) {
    // Do not do anything if the form is invalid.
    if (form.invalid) {
      return;
    }

    // Hide any previous login error.
    this.modifError = false;

    const tricksUrl = `${environment.apiUrl}/tricks/${this.id}`;
    this.http.put(tricksUrl, this.modifRequest).subscribe({
      next: () => {
        this.presentToast().then(() => {
          this.modifView = false
        })
          .then(() => {
            window.location.reload();
          });
      },
      error: (err) => {
        this.modifError = true;
        console.warn(`Trick modify failed: ${err.message}`);
      },
    });
  }

  public modifUser = false
  //Modify profile of user
  modifProfile() {
    this.toggleUserModif()
    this.modifUserRequest = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      userName: this.user.userName
    }
  }

  toggleUserModif() {
    this.modifUser = !this.modifUser
  }

  //Handle modif of a user
  onUserSubmit(form: NgForm) {
    // Do not do anything if the form is invalid.
    if (form.invalid) {
      return;
    }

    // Hide any previous login error.
    this.modifUserError = false;

    const userUrl = `${environment.apiUrl}/users/${this.user._id}`;
    this.http.put(userUrl, this.modifUserRequest).subscribe({
      next: (res) => {
        this.presentToastUser().then(() => {
          this.modifUser = false
        })
          .then(() => {
            window.location.reload();
          });
      },
      error: (err) => {
        this.modifError = true;
        console.warn(`User modify failed: ${err.message}`);
      },
    });
  }

  //Function for toast message
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Tricks modifié!',
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }

  //Function for toast message
  async presentToastUser() {
    const toast = await this.toastController.create({
      message: 'Profil modifié!',
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }

  //Launch the video when click on image
  launchVideo(e){
    const videoUrl = e.srcElement.attributes.src.nodeValue
    //Reste du code pour lancer la vidéo...
    console.log(videoUrl + " playing...")
  }
}
