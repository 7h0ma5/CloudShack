import { Component, Input } from "@angular/core";

@Component({
    selector: "compass",
    templateUrl: "./compass.component.html",
    host: { "style": "display: inline-block" }
})
export class CompassComponent {
    @Input() heading: number = 0;
}
