import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { ContactsListComponent } from "./contacts.list.component";
import { ContactsNewComponent } from "./contacts.new.component";
import { ContactsShowComponent } from "./contacts.show.component";
//import { ContactsEditComponent } from "./contacts.edit.component";
import { ContactsMapComponent } from "./contacts.map.component";
import { ContactsImportComponent } from "./contacts.import.component";
import { ContactsExportComponent } from "./contacts.export.component";

import {
    WorldMapComponent,
    SmartInputDirective,
    UppercaseDirective,
    SharedModule
} from "../shared/index";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([
            { path: "", component: ContactsListComponent },
            { path: "new", component: ContactsNewComponent },
            { path: "map", component: ContactsMapComponent },
            { path: "import", component: ContactsImportComponent },
            { path: "export", component: ContactsExportComponent },
            { path: ":id", component: ContactsShowComponent },
        ])
    ],
    declarations: [
        ContactsListComponent,
        ContactsNewComponent,
        ContactsShowComponent,
        ContactsMapComponent,
        ContactsImportComponent,
        ContactsExportComponent,
        WorldMapComponent,
        SmartInputDirective,
        UppercaseDirective
    ]
})
export class ContactsModule {}
