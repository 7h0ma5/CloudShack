import { Component } from "@angular/core";
import { URLSearchParams } from "@angular/http";

@Component({
    templateUrl: "/app/+contacts/contacts.export.component.html"
})
export class ContactsExportComponent {
    dateRange: boolean = false;
    start: string = null;
    end: string = null;

    constructor() {
        let now = (new Date()).toJSON().slice(0, 19);
        this.start = now;
        this.end = now;
    }

    exportLink() {
        var params = new URLSearchParams();

        if (this.dateRange) {
            params.set("startkey", JSON.stringify(new Date(this.start)));
            params.set("endkey", JSON.stringify(new Date(this.end)));
        }

        return "/contacts/_adi" + "?" + params.toString();
    }
}
