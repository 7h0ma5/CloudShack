import {Component, View, NgIf, NgFor, FORM_DIRECTIVES} from "angular2/angular2";
import {ContactService} from "../../services/contact";
import {WorldMap} from "../../components/worldmap";
import {MODES, CONTESTS} from "../../constants";

@Component({
    providers: [ContactService]
})
@View({
    templateUrl: "/templates/contact/new.html",
    directives: [WorldMap, NgIf, NgFor, FORM_DIRECTIVES]
})
export class NewContactPage {
    contact: Object = {};
    dxcc: Object = null;
    callbook: Object = null;
    startDate: Date = new Date();
    endDate: Date = new Date();
    maptarget: [number, number] = null;
    modes = MODES;
    contests = CONTESTS;

    constructor(
        public api: ContactService
    ) {

    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    reset() {

    }

    sendCW(text) {
        console.log("Send CW:", text);
    }
}
