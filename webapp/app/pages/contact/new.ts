import {Component, View, NgIf, NgFor, FORM_DIRECTIVES} from "angular2/angular2";
import {ContactService} from "../../services/contact";
import {DxccService} from "../../services/dxcc";
import {TAB_DIRECTIVES} from "../../components/tabs";
import {Uppercase} from "../../components/uppercase";
import {WorldMap} from "../../components/worldmap";
import {MODES, CONTESTS} from "../../constants";

@Component({
    providers: [ContactService, DxccService]
})
@View({
    templateUrl: "/templates/contact/new.html",
    directives: [WorldMap, Uppercase, NgIf, NgFor, TAB_DIRECTIVES, FORM_DIRECTIVES]
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
        public api: ContactService,
        public dxccService: DxccService
    ) {

    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    save() {
        console.log(this.contact);
    }

    reset() {

    }

    sendCW(text) {
        console.log("Send CW:", text);
    }
}
