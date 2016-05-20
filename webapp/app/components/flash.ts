import {Component} from "angular2/core";
import {NgIf} from "angular2/common";
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
        flash.fire.subscribe(this.show.bind(this));
    }

    show(message: FlashMessage) {
        this.message = message;
        this.visible = true;

        window.clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => this.visible = false, 5000);
    }
}
