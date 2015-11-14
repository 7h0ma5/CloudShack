import {Component, NgIf} from "angular2/angular2";
import {Flash, FlashMessage} from "../services/flash";

@Component({
    selector: "flash-view",
    template: `
      <div class="flash" [hidden]="!visible">
        <span class="flash-{{message?.level}}">{{message?.text}}</span>
      </div>
    `,
    directives: [NgIf]
})
export class FlashView {
    message: FlashMessage = null;
    visible: boolean = false;
    timeout: any = null;

    constructor(flash: Flash) {
        flash.fire.subscribe((message: FlashMessage) => this.show(message));
    }

    show(message: FlashMessage) {
        console.log("Show Message", message);
        this.message = message;
        this.visible = true;

        window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => this.visible = false, 5000);
    }
}
