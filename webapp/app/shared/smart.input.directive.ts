import { Directive, ElementRef, HostListener, Output, EventEmitter } from "@angular/core";

@Directive({
    selector: "[ngModel][smartInput]"
})
export class SmartInputDirective {
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter()

    constructor(private elementRef: ElementRef) {}

    @HostListener("blur", ["$event"])
    blur(event) {
        let element: HTMLInputElement = this.elementRef.nativeElement;
        if (!element.value.length || element.value.length == 0) {
            this.ngModelChange.emit(element.placeholder || "");
        }
    }
}
