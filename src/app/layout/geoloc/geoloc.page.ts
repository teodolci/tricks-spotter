import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';

import { latLng, Map, MapOptions, marker, Marker, tileLayer } from 'leaflet';
import { defaultIcon } from 'src/app/models/default-marker';

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
          { maxZoom: 15 }
        )
      ],
      zoom: 13,
      center: latLng(46.519962, 6.633597)
    };
    this.mapMarkers = [];
  }

  ionViewWillEnter(): void {
    // Make an HTTP request to retrieve the spots.
    const url = `${environment.apiUrl}/spots`;
    this.http.get<Paginated<Spot>>(url).subscribe((spots) => {
      spots.data.forEach(spot => {
        console.log(spot)
        this.mapMarkers.push(marker([spot.geolocation[0], spot.geolocation[1]], {icon:defaultIcon}))
      })
    });
  }

  onMapReady(map: Map) {
    setTimeout(() => map.invalidateSize(), 0);
  }

}
