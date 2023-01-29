import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { spotRequest } from 'src/app/models/spot-request';
import { environment } from 'src/environments/environment';

import { Geolocation } from '@capacitor/geolocation';
import { latLng, Map, MapOptions, marker, Marker, tileLayer, icon, LatLng } from 'leaflet';
import { defaultIcon } from 'src/app/models/default-marker';
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
  selector: 'app-addspot',
  templateUrl: './addspot.page.html',
  styleUrls: ['./addspot.page.scss'],
})
export class AddspotPage implements OnInit {

  spotRequest: spotRequest
  spotError: boolean;

  map: Map;
  mapOptions: MapOptions;
  mapMarkers: any[];

  picture: QimgImage

  constructor(private http: HttpClient, private router: Router, private toastController: ToastController, private pictureService: PictureService) {
    this.spotRequest = {
      name: undefined,
      description: undefined,
      category: undefined,
      geolocation: undefined,
      picture: undefined
    },
    this.mapOptions = {
      layers: [
        tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 18 }
        )
      ],
      zoom: 13,
      minZoom: 10,
      center: latLng(46.519962, 6.633597),
      zoomControl: false,
      attributionControl: false
    };
    this.mapMarkers = undefined
  }

  //Get the position of the device and place it on the map
  public coordinate = undefined
  async getDevicePosition() {
    const coordinate = await Geolocation.getCurrentPosition()
    this.coordinate = coordinate
  }

  async ngOnInit() {
    await this.getDevicePosition()
    //Place the marker of the device (Which will indicate the spot position)
    this.mapMarkers = [marker(latLng(this.coordinate.coords.latitude, this.coordinate.coords.longitude), { icon: defaultIcon, draggable: true, autoPan: true })];
  }

  public categories = ['ledge', 'gap', 'rail', 'ramp', 'manual', 'stairs', 'park', 'bowl', 'handrail']
  onSubmit(form: NgForm) {
    // Do not do anything if the form is invalid.
    if (form.invalid) {
      return;
    }

    //Set the coordinates of the marker on the map and url of the photo
    this.spotRequest.geolocation = [this.mapMarkers[0].getLatLng().lat, this.mapMarkers[0].getLatLng().lng]
    this.spotRequest.picture = /* this.picture.url ?? */ "picture.png"   //As i don't have the access token I'll put a picture.png to the url

    // Hide any previous login error.
    this.spotError = false;
    const spotUrl = `${environment.apiUrl}/spots`;

    //Make the request to post the spot to API
    this.http.post<Spot>(spotUrl, this.spotRequest).subscribe({
      next: () => {
        this.presentToast().then(() => {
          this.router.navigateByUrl("/geoloc")
        })
        .then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        this.spotError = true;
        console.warn(`Spot post failed: ${err.message}`);
      },
    });
  }

  //Take picture
  takePicture(){
    this.pictureService.takeAndUploadPicture().subscribe(
      res => this.picture = res
      )
  }

  //Function for toast message
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Nouveau spot posté!',
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }

  //Solve tiles bug on map
  onMapReady(map: Map) {
    setTimeout(() => map.invalidateSize(), 0);
  }
}
