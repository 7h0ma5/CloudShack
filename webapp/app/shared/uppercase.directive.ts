import { Directive, Renderer, ElementRef, HostListener, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, DefaultValueAccessor } from "@angular/forms";

const PROVIDER = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UppercaseDirective),
    multi: true
};

@Directive({
    selector: "input[uppercase]",
    providers: [PROVIDER]
})
export class UppercaseDirective extends DefaultValueAccessor {
    constructor(_renderer: Renderer, _elementRef: ElementRef) {
        super(_renderer, _elementRef, true);
    }

    @HostListener("blur")
    blur() {
        this.onTouched();
    }

    @HostListener("input", ["$event.target.value"])
    input(value) {
        this.onChange(value.toUpperCase());
    }
}
