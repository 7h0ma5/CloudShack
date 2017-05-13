import { Injectable } from "@angular/core";
import { SocketService } from "./socket.service";

@Injectable()
export class RotService {
    constructor(private socket: SocketService) {}

    set_target(target) {
        this.socket.send({action: "rot.set_target", target: target});
    }
}
