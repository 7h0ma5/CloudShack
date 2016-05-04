import {Component, HostBinding, ElementRef} from "angular2/core";

@Component({
    selector: "[dropdown]",
    template: `
        <b><ng-content></ng-content></b>
    `
})
export class Dropdown {
    @HostBinding('class.dropdown') private addClass = true;

    private _isOpen:boolean;

    constructor(public _elementRef: ElementRef) {
        // todo: bind to route change event
    }
}
