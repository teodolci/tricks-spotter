import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';

import { latLng, Map, MapOptions, marker, Marker, tileLayer } from 'leaflet';
import { defaultIcon } from 'src/app/models/default-marker';

//Pattern of the paginated datas
type Paginated<T = unknown> = {
  data: T[],
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
export class GeolocPage implements ViewWillEnter {

  spot: Spot;

  map: Map;
  mapOptions: MapOptions;
  mapMarkers: Marker[];

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
      zoom: 15,
      center: latLng(46.519962, 6.633597),
      zoomControl: false
    };
    this.mapMarkers = [];
  }

  
  ionViewWillEnter(): void {
    // Make an HTTP request to retrieve the spots.
    const url = `${environment.apiUrl}/spots`;
    this.http.get<Paginated<Spot>>(url).subscribe((spots) => {
      spots.data.forEach(spot => {
        this.data.push(spot.name)
        this.mapMarkers.push(marker([spot.geolocation[0], spot.geolocation[1]], { icon: defaultIcon }).bindPopup(spot.name))
      })
    });
  }

  //Manage the search bar with the names of the spots
  public data = [];
  public results = [...this.data];
  public focused = false;
  handleChange(event) {
    const query = event.target.value.toLowerCase();
    this.results = this.data.filter(d => d.toLowerCase().indexOf(query) > -1);
    //Limiter à 5 elements de complétion de recherche
    if (this.data.length >= 5) this.results = this.results.slice(0, 5)
    if (this.results.length != 0) {
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
  }

  onMapReady(map: Map) {
    setTimeout(() => map.invalidateSize(), 0);
  }

}
