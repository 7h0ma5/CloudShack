import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { ProfilesEditComponent } from "./profiles.edit.component";

import {
    SharedModule
} from "../shared/index";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([
            { path: "new", component: ProfilesEditComponent },
            { path: "edit/:id", component: ProfilesEditComponent }
        ])
    ],
    declarations: [
        ProfilesEditComponent
    ]
})
export class ProfilesModule {}

