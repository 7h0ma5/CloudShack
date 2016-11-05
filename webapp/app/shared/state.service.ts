import { Injectable, Output, EventEmitter } from "@angular/core";
import { SocketService } from "./socket.service";

@Injectable()
export class StateService {
    @Output() rigChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() profileChange: EventEmitter<any> = new EventEmitter<any>();

    profile: {} = {};
    rig: {} = {};
    log: {} = {};

    constructor(socketService: SocketService) {
        socketService.state.subscribe(this.onUpdate.bind(this));
    }

    onUpdate(newState) {
        console.debug("Received a new state:", newState);

        for (let key in newState) {
            let value = newState[key] || {};
            this[key] = value;

            switch (key) {
                case "rig": this.rigChange.next(value); break;
                case "profile": this.profileChange.next(value); break;
            }
        }
    }
}
