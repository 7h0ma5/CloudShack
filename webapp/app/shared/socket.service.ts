import { Injectable, Output, EventEmitter } from "angular2/core";
import { ReplaySubject } from "rxjs/ReplaySubject";

export class Spot {
    time: String;
    spotter: String;
    call: String;
    freq: number;
    comment: String;

    constructor(data) {
        this.time = data.time;
        this.spotter = data.spotter;
        this.call = data.call;
        this.freq = data.freq;
        this.comment = data.comment;
    }
}

@Injectable()
export class SocketService {
    state: ReplaySubject<any> = new ReplaySubject<Spot>(10, null);
    spot: ReplaySubject<Spot> = new ReplaySubject<Spot>(10, null);
    socket: WebSocket = null;

    constructor() {
        this.connect();
    }

    connect() {
        let loc = window.location;
        let url = "ws://" + loc.host + loc.pathname + "websocket";
        this.socket = new WebSocket(url);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }

    send(data) {
        if (this.socket) {
            this.socket.send(JSON.stringify(data));
        }
        else {
            console.warn("Websocket not connected. Unable to send:", data);
        }
    }

    onClose() {
        this.socket = null;
        setTimeout(this.connect.bind(this), 5000);
    }

    onMessage(messageEvent) {
        try {
            let message = JSON.parse(messageEvent.data);
            if (message.event && message.data) {
                this.onEvent(message.event, message.data);
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    onEvent(event, data) {
        switch (event) {
            case "spot":
                let spot = new Spot(data);
                this.spot.next(spot);
                break;
            case "state":
                this.state.next(data);
                break;
            default:
                console.warn("Unknown websocket event:", event);
        }
    }
}
