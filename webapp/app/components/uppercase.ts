import {Directive, Inject, ElementRef} from "angular2/angular2";

@Directive({
    selector: "input[uppercase]"
})
export class Uppercase {
    constructor(@Inject(ElementRef) elementRef: ElementRef) {

    }
}
