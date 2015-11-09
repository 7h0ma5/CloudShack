import {Component, View, NgFor} from "angular2/angular2";
import {ContactsService} from "../services/contacts";

@Component({
    providers: [ContactsService]
})
@View({
    templateUrl: "/templates/logbook.html",
    directives: [NgFor]
})
export class LogbookPage {
    result: Array<Object>;

    constructor(public contacts: ContactsService) {
        this.result = [];
        this.contacts.get().subscribe(contacts => {
            console.log(contacts);
            this.result = contacts.rows;
        });
    }
}
