import { Injectable } from "angular2/core";
import { SocketService } from "./socket.service";

@Injectable()
export class StateService {
    state = {};

    constructor(socketService: SocketService) {
        socketService.state.subscribe(this.onUpdate.bind(this));
    }

    onUpdate(newState) {
        console.log("received state update:", this.state);
        console.log("old state: ", this.state);
        Object.assign(this.state, newState);
        console.log("new state: ", this.state);
    }
}
