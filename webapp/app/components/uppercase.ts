import {Directive, Inject, ElementRef} from "angular2/core";

@Directive({
    selector: "input[uppercase]"
})
export class Uppercase {
    constructor(@Inject(ElementRef) elementRef: ElementRef) {

    }
}
