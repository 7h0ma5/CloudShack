import { DropdownDirective } from "./dropdown.directive";
import { Directive, ElementRef, OnDestroy, Host, HostListener } from "@angular/core";

@Directive({
    selector: "[dropdown-toggle]"
})
export class DropdownToggleDirective implements OnDestroy {
    constructor(@Host() public dropdown: DropdownDirective,
                private elementRef: ElementRef) {}

    private closeDropdownBind: EventListener = this.closeDropdown.bind(this);

    @HostListener("click", ['$event'])
    toggle(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (this.dropdown.isOpen) {
            this.dropdown.close();
            window.document.removeEventListener("click", this.closeDropdownBind);
        }
        else {
            this.dropdown.open();
            window.document.addEventListener("click", this.closeDropdownBind);
        }
    }

    closeDropdown(event: MouseEvent) {
        if (event.target !== this.elementRef.nativeElement) {
            this.dropdown.close();
            window.document.removeEventListener("click", this.closeDropdownBind);
        }
    }

    ngOnDestroy() {
        window.document.removeEventListener("click", this.closeDropdownBind);
    }
}
