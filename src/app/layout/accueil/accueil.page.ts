import { Component, OnInit } from '@angular/core';
import { WebsocketService } from 'src/app/models/websocket.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.page.html',
  styleUrls: ['./accueil.page.scss'],
})
export class AccueilPage implements OnInit {

  constructor(private wsService: WebsocketService) { }

  ngOnInit() {
  }

}
