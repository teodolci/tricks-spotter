import { Injectable } from '@angular/core';
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

const WS_SERVER_URL = 'ws://tricks-spotter-api.onrender.com';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
    // A ReplaySubject will emit its X latest values (1 in this case) each time
    // its 'subscribe()' method is called
    private ws$ = new ReplaySubject<WebSocket>(1);

    constructor() {
        const socket = new WebSocket(WS_SERVER_URL);
        socket.onopen = () => {
            console.log('Successfully connected to the WebSocket at', WS_SERVER_URL);
            // When the connection is done, emit the WebSocket instance
            this.ws$.next(socket);
        };
    }
}