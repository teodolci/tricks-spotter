import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-geoloc',
  templateUrl: './geoloc.page.html',
  styleUrls: ['./geoloc.page.scss'],
})
export class GeolocPage implements ViewWillEnter {

  constructor(
    // Inject the AuthService
    private auth: AuthService,
    // Inject the HTTP client
    public http: HttpClient
  ) {}

  ionViewWillEnter(): void {
    // Make an HTTP request to retrieve the spots.
    const url = "https://tricks-spotter-api.onrender.com/spots";
    this.http.get(url).subscribe((spots) => {
      console.log(`Spots loaded`, spots);
    });
  }

}
