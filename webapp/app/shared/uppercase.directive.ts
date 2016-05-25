import { Directive, Renderer, ElementRef, HostListener, forwardRef, Provider } from "angular2/core";
import { NG_VALUE_ACCESSOR, DefaultValueAccessor } from 'angular2/common';
import { CONST_EXPR } from 'angular2/src/facade/lang';

const PROVIDER = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => UppercaseDirective), multi: true}
));

@Directive({
    selector: "input[uppercase]",
    bindings: [PROVIDER]
})
export class UppercaseDirective extends DefaultValueAccessor {
    constructor(_renderer: Renderer, _elementRef: ElementRef) {
        super(_renderer, _elementRef);
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
