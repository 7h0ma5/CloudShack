import { Component } from "angular2/core";
import { SocketService, Spot } from "./socket.service";

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
export class TickerComponent {
    spot: Spot;
    visible: boolean = false;
    timeout: any = null;

    constructor(socketService: SocketService) {
        socketService.spot.subscribe(this.onSpot.bind(this));
    }

    onSpot(spot) {
        this.spot = spot;
        this.visible = true;

        window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => this.visible = false, 5000);
    }
}
