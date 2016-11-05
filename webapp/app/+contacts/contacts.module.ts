import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { ContactsShowComponent } from "./contacts.show.component";
import { ContactsNewComponent } from "./contacts.new.component";
import { ContactsListComponent } from "./contacts.list.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
       { path: "new", component: ContactsNewComponent },
       { path: ":id", component: ContactsShowComponent },
       { path: "", component: ContactsListComponent },
    ])
  ],
  declarations: [
    ContactsNewComponent,
    ContactsShowComponent,
    ContactsListComponent
  ]
})
export class ContactsModule {}
