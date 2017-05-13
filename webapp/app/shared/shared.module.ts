import { NgModule } from "@angular/core";
import { CommonModule }  from "@angular/common";

import { TAB_DIRECTIVES } from "./tabs.component";
import { DROPDOWN_DIRECTIVES } from "./dropdown/index";
import { UppercaseDirective } from "./uppercase.directive";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        TAB_DIRECTIVES,
        DROPDOWN_DIRECTIVES,
        UppercaseDirective,
    ],
    exports: [
        TAB_DIRECTIVES,
        DROPDOWN_DIRECTIVES,
        UppercaseDirective
    ]
})
export class SharedModule {}
