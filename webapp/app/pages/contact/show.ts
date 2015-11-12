import {Component, View} from "angular2/angular2";
import {NgIf, NgSwitch, NgSwitchWhen, NgSwitchDefault} from "angular2/angular2";
import {RouteParams, Router, Location} from "angular2/router";
import {ContactService} from "services/contact";

@Component({
    providers: [ContactService]
})
@View({
    templateUrl: "/templates/contact/show.html",
    directives: [NgIf, NgSwitch, NgSwitchWhen, NgSwitchDefault]
})
export class ShowContactPage {
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
