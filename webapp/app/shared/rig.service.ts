import { Injectable } from "@angular/core";
import { StateService } from "./state.service";
import { SocketService } from "./socket.service";

@Injectable()
export class RigService {
    constructor(private state: StateService, private socket: SocketService) {}

    set_freq(freq) {
        this.socket.send({action: "rig.set_freq", freq: "freq"});
    }

    set_mode(mode, passband) {
        this.socket.send({action: "rig.set_mode", mode: mode, passband: passband});
    }

    send_cw(text) {
        this.socket.send({action: "rig.send_cw", text: text});
    }
}
