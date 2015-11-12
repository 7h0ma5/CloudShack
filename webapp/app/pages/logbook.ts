import {Component, View, NgFor, NgIf} from "angular2/angular2";
import {RouterLink} from "angular2/router";
import {ContactService} from "../services/contact";

@Component({
    providers: [ContactService]
})
@View({
    templateUrl: "/templates/logbook.html",
    directives: [RouterLink, NgFor, NgIf]
})
export class LogbookPage {
    contacts: Array<Object> = [];
    filter: String = null;
    limit: number = 20;
    pages = {prev: [], next: null, start: null};

    constructor(public api: ContactService) {
        this.reload();
    }

    reload() {
        var options = {
            descending: true,
            limit: this.limit + 1
        };

        if (this.filter) {
            options["startkey"] = JSON.stringify([this.filter]);
            options["endkey"] = JSON.stringify([this.filter, {}]);
            options["descending"] = false;
        }

        if (this.pages.start) {
            options["startkey"] = JSON.stringify(this.pages.start.key);
            options["startkey_docid"] = this.pages.start.id;
        }

        var req = (this.filter ? this.api.byCall : this.api.all).bind(this.api);

        req(options).subscribe(result => {
            this.contacts = result.rows.slice(0, this.limit);
            this.pages["next"] = result.rows[this.limit];
        }, err => {
            this.contacts = null;
        });
    }

    nextPage() {
        this.pages.prev.push(this.pages.start);
        this.pages.start = this.pages.next;
        this.pages.next = null;
        this.reload();
    }

    prevPage() {
        this.pages.next = this.pages.start;
        this.pages.start = this.pages.prev.pop();
        this.reload();
    }

    hasNextPage() : boolean {
        return !!this.pages.next;
    }

    hasPrevPage() : boolean {
        return !!this.pages.start;
    }

    resetPages() {
        this.pages.prev = [];
        this.pages.next = null;
        this.pages.start = null;
    }

    filterCallsign(callsign: String) {
        this.filter = callsign;
        this.resetPages();
        this.reload();
    }
}
