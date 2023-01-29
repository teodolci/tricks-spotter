import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';

import { latLng, Map, MapOptions, marker, Marker, tileLayer, icon, LatLng } from 'leaflet';
import { defaultIcon } from 'src/app/models/default-marker';

import { Geolocation } from '@capacitor/geolocation';
import { User } from 'src/app/models/user';
import { NgForm } from '@angular/forms';

//Pattern of the paginated datas
type Paginated<T = unknown> = {
  data: T[],
  page: number,
  pageSize: number,
  total: number;
}

declare type Spot = {
  _id: string;
  name: string;
  description: string;
  category: string[];
  geolocation: number[];
  picture: string;
  creationDate: Date;
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

declare type SpotModif = {
  name: string,
  description: string,
  category: string[],
  geolocation: number[],
  picture: string
}

@Component({
  selector: 'app-geoloc',
  templateUrl: './geoloc.page.html',
  styleUrls: ['./geoloc.page.scss'],
})
export class GeolocPage implements OnInit {

  spot: Spot;
  spotDetails: Spot
  spots: any[];

  userTrick: any

  map: Map;
  mapOptions: MapOptions;
  mapMarkers: any[];

  mapModif: Map;
  mapOptionsModif: MapOptions;
  mapMarkersModif: any[];

  isAdmin: boolean;

  modifRequest: SpotModif;
  modifError: boolean;

  constructor(
    // Inject the AuthService
    private auth: AuthService,
    // Inject the HTTP client
    public http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.mapOptions = {
      layers: [
        tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 18 }
        )
      ],
      zoom: 14,
      minZoom: 10,
      center: latLng(46.519962, 6.633597),
      zoomControl: false,
      attributionControl: false
    };
    this.mapMarkers = [];
    this.spotDetails = {
      _id: undefined,
      name: undefined,
      description: undefined,
      category: undefined,
      geolocation: [undefined, undefined],
      picture: undefined,
      creationDate: undefined
    }
    this.modifRequest = {
      name: "",
      description: "",
      category: [""],
      geolocation: [0, 0],
      picture: ""
    }
    this.mapOptionsModif = {
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
    this.mapMarkersModif = undefined
  }

  //Get the position of the device and place it on the map
  public coordinate = undefined
  async getDevicePosition() {
    const coordinate = await Geolocation.getCurrentPosition()
    this.coordinate = coordinate
    //set device position to map
    this.mapMarkers.unshift(marker(latLng(this.coordinate.coords.latitude, this.coordinate.coords.longitude), {
      icon: defaultIcon
    }))
  }

  public spotTotal = undefined
  // On page initialisation
  async ngOnInit() {
    await this.getDevicePosition()
    this.getSpots(this.results)

    //Get admin role
    this.auth.getUser$()
      .subscribe(userData => {
        this.isAdmin = userData.admin
      });
  }

  //Show spot detail
  public spotDetailActive = false
  async showSpot(e) {
    this.toggleDetails()
    const id = e.srcElement.attributes.id.nodeValue
    const url = `${environment.apiUrl}/spots/${id}`;
    this.http.get<Spot>(url).subscribe((spot) => {
      this.spotDetails = spot
      this.getTricksPage(this.pageCounter)
    })
  }

  //Toggle details modal
  toggleDetails() {
    this.spotDetailActive = !this.spotDetailActive
  }


  //toggle the list of all the spots
  public listActive = false
  toggleList() {
    this.listActive = !this.listActive
  }


  //center map to point
  centerMap(point: LatLng) {
    this.map.setView(point, 16)
    //ça marche pas apparement this.map n'est pas défini, je sais pas comment faire....
  }


  //Manage the search bar with the names of the spots
  public spotsNames = [];
  public results = [...this.spotsNames];
  public focused = false;
  public resultsLimited = []
  handleChange(event) {
    const query = event.target.value.toLowerCase();
    this.results = this.spotsNames.filter(d => d.toLowerCase().indexOf(query) > -1);
    //Limiter à 5 elements de complétion de recherche
    if (this.spotsNames.length >= 5) {
      this.resultsLimited = this.results.slice(0, 5)
    }
    if (this.resultsLimited.length != 0) {
      this.focused = true
    } else {
      this.focused = false
    }
  }
  handleFocus() {
    if (this.results.length != 0) this.focused = true
  }
  handleBlur() {
    this.focused = false
    this.getSpots(this.results)
  }


  //Solve tiles bug on map
  onMapReady(map: Map) {
    setTimeout(() => map.invalidateSize(), 0);
  }


  //Retrieve spots
  public tricksSpot = 0
  getSpots(filter: string[]) {
    this.spots = []
    this.mapMarkers = []
    // Make an HTTP request to retrieve all the spots.
    const url = `${environment.apiUrl}/spots`;
    this.http.get<Paginated<Spot>>(url).subscribe((spots) => {
      this.spotTotal = spots.total
      //For each page get the spots
      for (let i = 1; i <= Math.ceil(this.spotTotal / 10); i++) {
        this.http.get<Paginated<Spot>>(`${url}?page=${i}`).subscribe((spots) => {
          spots.data.forEach(spot => {
            this.http.get<Paginated<Spot>>(`${url}/${spot._id}/tricks`).subscribe((tricks) => {
              this.tricksSpot = tricks.total
            })
            if (filter.length > 0) {// Filter with the results of the searchBar
              if (this.results.includes(spot.name)) {
                this.spots.push(spot)
                this.setMarkers(spot)
              }
            } else {
              this.spotsNames.push(spot.name)
              this.spots.push(spot)
              this.setMarkers(spot)
            }
          })
        })
      }
    });
    //Set the device position again
    this.getDevicePosition()
  }

  public tricks = []
  public pageCounter = 1
  public everythingLoaded = false
  //Get The tricks for the specific paginated page nmb
  async getTricksPage(page: number) {
    const url = `${environment.apiUrl}/spots/${this.spotDetails._id}/tricks`;
    const urlUser = `${environment.apiUrl}/users`;
    this.tricks = []
    await this.http.get<Paginated<Trick>>(url).subscribe((tricks) => {
      tricks.data.forEach(trick => {
        //Get the user name
        this.http.get<User>(`${urlUser}/${trick.userId}`).subscribe((user) => {
          trick.userName = user.userName
        });
        this.tricks.push(trick)
      });
      //Check if everything is loaded
      if (tricks.page * tricks.pageSize >= tricks.total) this.everythingLoaded = true
    });
  }

  //Load more tricks
  loadMore() {
    this.pageCounter++
    this.getTricksPage(this.pageCounter)
  }

  //Set markers
  setMarkers(spot: Spot) {
    //Create a custom icon for the marker
    const customIcon = icon({
      iconUrl: `assets/icon/markers/${spot.category[0]}-marqueur.png`,

      iconSize: [25, 38], // size of the icon
      iconAnchor: [12, 38],
      popupAnchor: [1, -34],

    });
    this.mapMarkers.push(marker(latLng(spot.geolocation[0], spot.geolocation[1]), { icon: customIcon, title: spot._id })
      .on("click", this.showSpotFromMarker))
  }

  //Je comprends rien à ces event de Leaflet je trouve pas la doc claire...
  showSpotFromMarker(e) {
    this.toggleDetails()
    const spotId = e.sourceTarget.options.title
    const url = `${environment.apiUrl}/spots/${spotId}`;
    console.log(spotId)
    this.http.get<Spot>(url).subscribe((spot) => {
      this.spotDetails = spot
      this.getTricksPage(this.pageCounter)
    })
  }

  //Delete a spot
  async deleteSpot(event: any) {
    await this.presentAlert()

    if (this.roleMessage == "confirmer") { //Supprime le spot
      const id = event.srcElement.attributes.id.nodeValue
      const urlSpot = `${environment.apiUrl}/spots/${id}`;
      this.http.delete(urlSpot).subscribe({
        next: (res) => {
          const index = this.spots.indexOf(res)
          this.tricks.splice(index, 1)
          window.location.reload()
          console.warn("Spot deleted")
        },
        error: (err) => {
          console.warn(`Spot delete failed: ${err.message}`);
        },
      });
    } else { //Ne supprime pas le spot
      console.log("annulé")
    }
  }

  //Modify a Spot
  public id = undefined
  public modifView = false
  async modifSpot(event: any) {
    this.modifView = true
    this.id = event.srcElement.attributes.id.nodeValue
    //Retrieve the infos of the trick to modify
    const spotUrl = `${environment.apiUrl}/spots/${this.id}`
    this.http.get<Spot>(spotUrl).subscribe((spot) => {
      this.modifRequest = { name: spot.name, description: spot.description, category: spot.category, geolocation: spot.geolocation, picture: spot.picture }
      this.mapMarkersModif = [marker(latLng(spot.geolocation[0], spot.geolocation[1]), { icon: defaultIcon, draggable: true, autoPan: true })]
    })
  }

  //Toggle modif view
  toggleView() {
    this.modifView = !this.modifView
  }

  //Handle the submit to modify a spot
  public categories = ['ledge', 'gap', 'rail', 'ramp', 'manual', 'stairs', 'park', 'bowl', 'handrail']
  onSubmit(form: NgForm) {
    // Do not do anything if the form is invalid.
    if (form.invalid) {
      return;
    }

    // Hide any previous login error.
    this.modifError = false;

    this.modifRequest.geolocation = [this.mapMarkersModif[0].getLatLng().lat, this.mapMarkersModif[0].getLatLng().lng]

    const spotsUrl = `${environment.apiUrl}/spots/${this.id}`;
    this.http.put(spotsUrl, this.modifRequest).subscribe({
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
        console.warn(`Spot modify failed: ${err.message}`);
      },
    });
  }

  //Function for toast message
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Spot modifié!',
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }

  //Manage the alert box
  handlerMessage = '';
  roleMessage = '';
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Vous allez supprimer un spot!',
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

  //Launch the video when click on image
  launchVideo(e) {
    const videoUrl = e.srcElement.attributes.src.nodeValue
    //Reste du code pour lancer la vidéo...
    console.log(videoUrl + " playing...")
  }
}
