import {Component, View, NgIf, NgFor, FORM_DIRECTIVES} from "angular2/angular2";
import {Control} from "angular2/angular2";
import {Http, Response} from "angular2/http";
import {ContactService} from "../../services/contact";
import {TAB_DIRECTIVES} from "../../components/tabs";
import {Uppercase} from "../../components/uppercase";
import {WorldMap} from "../../components/worldmap";
import {MODES, CONTESTS} from "../../constants";

@Component({
    providers: [ContactService]
})
@View({
    templateUrl: "/templates/contact/new.html",
    directives: [WorldMap, Uppercase, NgIf, NgFor, TAB_DIRECTIVES, FORM_DIRECTIVES]
})
export class NewContactPage {
    contact: Object = {};
    dxcc: Object = null;
    callbook: Object = null;
    maptarget: [number, number] = null;
    callsign: Control = new Control();

    startDate: Date = new Date();
    endDate: Date = new Date();

    modes = MODES;
    contests = CONTESTS;

    constructor(
        public api: ContactService,
        public http: Http
    ) {
        this.callsign.valueChanges
            .debounceTime(500)
            .switchMap(val => this.http.get("/dxcc/" + val))
            .filter((res: Response) => res.status == 200)
            .map((res: Response) => res.json())
            .subscribe((dxcc: any) => this.updateDxcc(dxcc));
    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    save() {
        console.log(this.contact);
    }

    reset() {

    }

    updateDxcc(dxcc) {
        this.dxcc = dxcc;

        if (!dxcc) {
            delete this.contact["dxcc"];
            delete this.contact["cqz"];
            delete this.contact["ituz"];
            this.maptarget = null;
            return;
        }
        console.log(dxcc);
        this.contact["dxcc"] = dxcc["dxcc"];
        this.contact["cqz"] = dxcc["cqz"];
        this.contact["ituz"] = dxcc["ituz"];
        this.maptarget = dxcc["latlon"];
    }

    sendCW(text) {
        console.log("Send CW:", text);
    }
}
