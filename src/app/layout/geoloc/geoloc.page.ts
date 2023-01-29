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

  public pageTotal = undefined
  public spots = []
  ngOnInit() {
    this.getDevicePosition()
    this.getSpots()

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
    if (this.spotsNames.length >= 5){
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
    this.getSpots()
    console.log(this.spots)
    if (this.results.length > 0) { //If there is something in the results of search do smthn
      this.spots.forEach(spot => {
        
        if (!this.results.includes(spot.name)) {
          const index = this.spots.indexOf(spot)
          this.spots.splice(index, 1)
          console.log(this.spots[index])
        }
      })
    }
  }


  //Solve tiles bug on map
  onMapReady(map: Map) {
    setTimeout(() => map.invalidateSize(), 0);
  }


  //Retrieve spots
  getSpots() {
    // Make an HTTP request to retrieve all the spots.
    const url = `${environment.apiUrl}/spots`;
    this.spots = []
    this.spotsNames = []
    this.http.get<Paginated<Spot>>(url).subscribe((spots) => {
      this.pageTotal = spots.total
      //1st page
      spots.data.forEach(spot => {
        this.spotsNames.push(spot.name)
        this.spots.push(spot)
        this.setMarkers(spot)
      })
      //For other pages
      for (let i = 2; i <= this.pageTotal; i++) {
        this.http.get<Paginated<Spot>>(`${url}?page=${i}`).subscribe((spots) => {
          spots.data.forEach(spot => {
            this.spotsNames.push(spot.name)
            this.spots.push(spot)
            this.setMarkers(spot)
          })
        })
      }
    });
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
