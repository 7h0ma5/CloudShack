import { Component } from "@angular/core";
import { SocketService, Spot } from "./socket.service";

@Component({
    selector: "ticker",
    template: `
        <div class="ticker-text" [hidden]="!visible">
            <i class="fa fa-globe fa-lg"></i>
            <b>{{spot?.call}}</b> on
            {{spot?.freq|number:'.3-3'}} by
            {{spot?.spotter}}
        </div>
    `
})
export class TickerComponent {
    spot: Spot;
    visible: boolean = false;
    timeout: any = null;

    constructor(socketService: SocketService) {
        socketService.spot.asObservable()
            .throttleTime(4000)
            .subscribe(this.onSpot.bind(this));
    }

    onSpot(spot) {
        this.spot = spot;
        this.visible = true;

        window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => this.visible = false, 5000);
    }
}
