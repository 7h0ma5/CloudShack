import { Injectable, Output, EventEmitter } from "angular2/core";
import { SocketService } from "./socket.service";

@Injectable()
export class StateService {
    @Output() stateChange: EventEmitter<any> = new EventEmitter<any>();

    state = {};

    constructor(socketService: SocketService) {
        socketService.state.subscribe(this.onUpdate.bind(this));
    }

    onUpdate(newState) {
        console.log("state update", newState);
        Object.assign(this.state, newState);
        this.stateChange.next(newState);
    }
}
