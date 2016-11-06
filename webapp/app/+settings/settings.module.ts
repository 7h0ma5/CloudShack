import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { SettingsComponent } from "./settings.component";
import { SharedModule } from "../shared/index";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([
            { path: "", component: SettingsComponent },
        ])
    ],
    declarations: [
        SettingsComponent
    ]
})
export class SettingsModule {}
