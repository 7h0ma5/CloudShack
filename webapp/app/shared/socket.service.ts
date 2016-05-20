import {Injectable, Output, EventEmitter} from "angular2/core";

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
    @Output() spot: EventEmitter<Spot> = new EventEmitter<Spot>();

    constructor() {
        let loc = window.location;
        let url = "ws://" + loc.host + loc.pathname + "websocket";
        let socket = new WebSocket(url);
        socket.onmessage = this.onMessage.bind(this);
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
            default:
                console.log("unknown websocket event:", event);
        }
    }
}
