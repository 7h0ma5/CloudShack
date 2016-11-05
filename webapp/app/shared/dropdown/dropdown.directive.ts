import { Directive, ElementRef, ContentChild, Output, EventEmitter } from "@angular/core";

@Directive({
    selector: "[dropdown]",
    host: {
        "[class.dropdown]": "true",
        "[class.open]": "isOpen"
    }
})
export class DropdownDirective {
    isOpen: boolean = false;
    open() { this.isOpen = true; }
    close() { this.isOpen = false; }
}
