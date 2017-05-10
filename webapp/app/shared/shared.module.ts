import { NgModule } from "@angular/core";
import { CommonModule }  from "@angular/common";

import { TAB_DIRECTIVES } from "./tabs.component";
import { DROPDOWN_DIRECTIVES } from "./dropdown/index";
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        TAB_DIRECTIVES,
        DROPDOWN_DIRECTIVES
    ],
    exports: [
        TAB_DIRECTIVES,
        DROPDOWN_DIRECTIVES
    ]
})
export class SharedModule {}
