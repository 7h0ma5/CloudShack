import {Directive, Renderer, ElementRef, Self, forwardRef, Provider} from "angular2/core";
import {NG_VALUE_ACCESSOR, DefaultValueAccessor } from 'angular2/common';
import {CONST_EXPR} from 'angular2/src/facade/lang';

const PROVIDER = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => Uppercase), multi: true}
));

@Directive({
    selector: "input[uppercase]",
    host: {'(input)': 'input($event.target.value)', '(blur)': 'blur()'},
    bindings: [PROVIDER]
})
export class Uppercase extends DefaultValueAccessor {
    constructor(_renderer: Renderer, _elementRef: ElementRef) {
        super(_renderer, _elementRef);
    }

    writeValue(value: any) : void {
      if (value) { value = value.toUpperCase(); }
      super.writeValue(value);
    }

    blur() {
        console.log("blur");
        this.onTouched();
    }

    input(value) {
        console.log("input", value);
        this.onChange(value.toUpperCase());
    }
}
