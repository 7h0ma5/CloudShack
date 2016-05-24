import { Component } from "angular2/core";
import { NgIf, NgSwitch, NgSwitchWhen, NgSwitchDefault } from "angular2/common";
import { RouteParams, Router } from "angular2/router";
import { Location } from "angular2/platform/common";
import { ContactService } from "../shared/index";

@Component({
    templateUrl: "/app/+contacts/contacts.show.component.html",
    directives: [NgIf, NgSwitch, NgSwitchWhen, NgSwitchDefault]
})
export class ContactsShowComponent {
    contact: Object = {};

    constructor(
        params: RouteParams,
        public api: ContactService,
        public router: Router,
        public location: Location
    ) {
        var id = params.get("id");
        this.api.get(id).subscribe(contact => this.contact = contact);
    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    edit() {
        this.router.navigate(["/EditContact", {id: this.contact["_id"]}]);
    }

    delete() {
        var msg = "Delete contact with " + this.contact["call"] + "?";
        if (!window.confirm(msg)) return;

        this.api.delete(this.contact["_id"], this.contact["_rev"]).subscribe(
            success => this.location.back(),
            error => alert("Failed to delete")
        );
    }
}
