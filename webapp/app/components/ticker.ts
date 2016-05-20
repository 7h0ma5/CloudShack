import {Component} from "angular2/core";
import {Socket, Spot} from "../services/socket";

@Component({
    selector: "ticker",
    template: `
        <div class="ticker-text" [hidden]="!visible">
            <i class="fa fa-globe fa-lg"></i>
            <b>{{spot?.call}}</b> on
            {{spot?.freq}} by
            {{spot?.spotter}}
        </div>
    `
})
export class Ticker {
    spot: Spot;
    visible: boolean = false;
    timeout: any = null;

    constructor(socket: Socket) {
        socket.spot.subscribe(this.onSpot.bind(this));
    }

    onSpot(spot) {
        this.spot = spot;
        this.visible = true;

        window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => this.visible = false, 5000);
    }
}
