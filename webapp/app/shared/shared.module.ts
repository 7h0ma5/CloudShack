import { NgModule } from "@angular/core";
import { CommonModule }  from "@angular/common";

import { TAB_DIRECTIVES } from "./tabs.component";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        TAB_DIRECTIVES
    ],
    exports: [
        TAB_DIRECTIVES
    ]
})
export class SharedModule {}
