import { Component } from "angular2/core";
import { StateService } from "./state.service";

@Component({
    selector: "status-select",
    template: `
        <div class="status-icon">
          <i class="fa fa-2x" [ngClass]="{'fa-wifi': onAir, 'fa-moon-o': !onAir}"></i>
        </div>
        <div class="status-text">
          <div class="status-operator">
            {{state.profile?.fields?.operator}}
          </div>
          <div class="status-message" (click)="toggle()">
            {{status}}
          </div>
        </div>
    `
})
export class StatusSelectComponent {
    onAir: boolean = false;
    status: string = "Off Air";

    constructor(public state: StateService) {
        this.toggle();
    }

    toggle() {
        this.onAir = !this.onAir;
        this.status = this.onAir ? "On Air" : "Off Air";
    }
}
