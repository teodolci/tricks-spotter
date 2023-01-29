import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';

import { latLng, Map, MapOptions, marker, Marker, tileLayer, icon, LatLng } from 'leaflet';
import { defaultIcon } from 'src/app/models/default-marker';

import { Geolocation } from '@capacitor/geolocation';

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

@Component({
  selector: 'app-geoloc',
  templateUrl: './geoloc.page.html',
  styleUrls: ['./geoloc.page.scss'],
})
export class GeolocPage implements OnInit {

  spot: Spot;
  spots: Spot[];

  map: Map;
  mapOptions: MapOptions;
  mapMarkers: any[];

  constructor(
    // Inject the AuthService
    private auth: AuthService,
    // Inject the HTTP client
    public http: HttpClient
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
  }

  //Show spot detail
  showSpot(e) {
    const id = e.srcElement.attributes.id.nodeValue
    console.log(id)
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
      for (let i = 1; i <= Math.ceil(this.spotTotal/10); i++) {
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

  //Set markers
  setMarkers(spot: Spot) {
    //Create a custom icon for the marker
    const customIcon = icon({
      iconUrl: `assets/icon/markers/${spot.category[0]}-marqueur.png`,

      iconSize: [25, 38], // size of the icon
      iconAnchor: [12, 38],
      popupAnchor: [1, -34],

    });
    this.mapMarkers.push(marker(latLng(spot.geolocation[0], spot.geolocation[1]), { icon: customIcon, title: spot.name }).bindPopup(spot.name))
  }
}
