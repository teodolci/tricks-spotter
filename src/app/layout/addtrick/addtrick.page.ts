import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

import { Trick } from 'src/app/models/trick';
import { trickRequest } from 'src/app/models/trick-request';
import { User } from 'src/app/models/user';
import { Spot } from 'src/app/models/spot';

import { PictureService } from 'src/app/picture/picture.service';
import { QimgImage } from 'src/app/models/Qimg-response';

//Pattern of the paginated datas
type Paginated<T = unknown> = {
  data: T[],
  page: number,
  pageSize: number,
  total: number;
}

@Component({
  selector: 'app-addtrick',
  templateUrl: './addtrick.page.html',
  styleUrls: ['./addtrick.page.scss'],
})

export class AddtrickPage implements OnInit {

  trickRequest: trickRequest
  trickRequestRight: trickRequest
  user: User
  spot: Spot
  trickError: boolean;

  video: QimgImage

  constructor(private http: HttpClient, private auth: AuthService, private router: Router, private toastController: ToastController, private pictureService: PictureService) {
    this.trickRequest = {
      name: undefined,
      video: undefined,
      spotId: undefined,
      userId: undefined,
    },
      this.trickRequestRight = {
        name: undefined,
        video: undefined,
        spotId: undefined,
        userId: undefined,
      }
  }

  public spots = []
  public pageTotal = undefined
  ngOnInit(): void {
    //Retrieve the infos of the user connected
    this.auth.getUser$()
      .subscribe(userData => {
        this.user = userData
      });
    this.trickRequestRight.userId = this.user._id

    //Get the spots
    const urlSpots = `${environment.apiUrl}/spots`;
    this.http.get<Paginated<Spot>>(urlSpots).subscribe((spots) => {
      this.pageTotal = spots.total
      //1st page
      spots.data.forEach(spot => {
        this.spots.push(spot)
      });
      //For all the other pages
      for (let i = 2; i <= this.pageTotal; i++) {
        this.http.get<Paginated<Spot>>(`${urlSpots}?page=${i}`).subscribe((spots) => {
          spots.data.forEach(spot => {
            this.spots.push(spot)
          })
        })
      }
    });
  }

  onSubmit(form: NgForm) {
    // Do not do anything if the form is invalid.
    if (form.invalid) {
      return;
    }

    // Hide any previous login error.
    this.trickError = false;

    this.trickRequest.video = /* this.video.url ?? */ "video.mp4"   //I actually don't know where to stock videos

    const tricksUrl = `${environment.apiUrl}/tricks`;
    const spotUrl = `${environment.apiUrl}/spots`;
    //Transform the spot name to _id
    this.http.get<Paginated<Spot>>(`${spotUrl}`).subscribe((spots) => {
      const spotTotal = spots.total
      let found = undefined
      let alreadyDone = false
      for (let i = 1; i <= Math.ceil(spotTotal / 10); i++) {
        this.http.get<Paginated<Spot>>(`${spotUrl}?page=${i}`).subscribe((spots) => {
          found = spots.data.find(element => element.name == this.trickRequest.spotId)
          if (found && !alreadyDone) {
            alreadyDone = true
            this.trickRequestRight.spotId = found._id
            this.trickRequestRight.name = this.trickRequest.name.charAt(0).toUpperCase() + this.trickRequest.name.slice(1)
            this.trickRequestRight.video = this.trickRequest.video
            //Make the request to post the trick to API
            this.http.post<Trick>(tricksUrl, this.trickRequestRight).subscribe({
              next: () => {
                this.presentToast().then(() => {
                  this.router.navigateByUrl("/profil")
                })
                  .then(() => {
                    window.location.reload();
                  });
              },
              error: (err) => {
                this.trickError = true;
                console.warn(`Trick post failed: ${err.message}`);
              },
            });
          }
        })
      }
    });
  }

  //Function for toast message
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Nouveau tricks post??!',
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }

  //Open camera to take video
  takeVideo() {
    this.pictureService.takeAndUploadPicture().subscribe(
      res => this.video = res
    )
  }
}
