import { Component } from "@angular/core";
import { ContactService } from "../shared/index";

@Component({
    templateUrl: "/app/+contacts/contacts.show.component.html"
})
export class ContactsShowComponent {
    contact: Object = {};

    constructor(
        public api: ContactService
    ) {
        var id = ""; // TODO
        this.api.get(id).subscribe(contact => this.contact = contact);
    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    edit() {
        //this.router.navigate(["/EditContact", {id: this.contact["_id"]}]);
    }

    delete() {
        var msg = "Delete contact with " + this.contact["call"] + "?";
        if (!window.confirm(msg)) return;

        this.api.delete(this.contact["_id"], this.contact["_rev"]).subscribe(
            success => null,//this.location.back(),
            error => alert("Failed to delete")
        );
    }
}
