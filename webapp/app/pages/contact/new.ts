import {Component, View} from "angular2/core";
import {Control, NgIf, NgFor, FORM_DIRECTIVES} from "angular2/common";
import {Http, Response} from "angular2/http";
import {ContactService} from "../../services/contact";
import {TAB_DIRECTIVES} from "../../components/tabs";
import {Uppercase} from "../../components/uppercase";
import {WorldMap} from "../../components/worldmap";
import {MODES, CONTESTS} from "../../constants";
import {Observable} from "rxjs/Rx";
import {coord_distance, coord_bearing, grid_to_coord} from "../../utils/geo";

const GRID_PRIORITY: number = 0;
const CALLBOOK_PRIORITY: number = 1;
const DXCC_PRIORITY: number = 2;

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

    startDate: Date = new Date();
    endDate: Date = new Date();

    callsign: Control = new Control();
    gridsquare: Control = new Control();
    mode: Control = new Control();

    maptargets: Array<[number, number]> = [null, null, null];
    maptarget: [number, number] = null;

    modes = MODES;
    submodes = null;
    rst = "";
    contests = CONTESTS;

    constructor(
        public api: ContactService,
        public http: Http
    )
    {
        this.callsign.valueChanges
            .debounceTime(500)
            .map(encodeURIComponent)
            .switchMap((val: string) => this.http.get("/dxcc/" + val))
            .catch((err, src, caught) => { this.resetDxcc(); return src; })
            .map((res: Response) => res.json())
            .subscribe((dxcc: any) => this.updateDxcc(dxcc));

        this.mode.valueChanges
            .debounceTime(50)
            .subscribe((mode: string) => this.updateMode(mode));

        this.gridsquare.valueChanges
            .debounceTime(200)
            .subscribe((grid: string) => this.updateGridsquare(grid));
    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    save() {
        console.log(this.contact);
    }

    reset() {
        this.resetDxcc();
        this.contact = {};
    }

    resetDxcc() {
        delete this.contact["dxcc"];
        delete this.contact["cqz"];
        delete this.contact["ituz"];
        delete this.contact["country"];
        this.removeMaptarget(DXCC_PRIORITY);
        this.dxcc = null;
    }

    updateDxcc(dxcc) {
        if (!dxcc) this.resetDxcc();

        this.dxcc = dxcc;
        this.contact["dxcc"] = dxcc["dxcc"];
        this.contact["cqz"] = dxcc["cqz"];
        this.contact["ituz"] = dxcc["ituz"];
        this.contact["country"] = dxcc["country"];
        this.updateMaptarget(dxcc["latlon"], DXCC_PRIORITY);
    }

    updateMode(newMode: string) {
        this.submodes = null;
        delete this.contact["submode"];

        this.modes.forEach(mode => {
            if (mode.name == newMode) {
                this.submodes = mode["submodes"];
                this.rst = mode["rst"] || "599";
            }
        });
    }

    updateGridsquare(newGrid: string) {
        var coord = grid_to_coord(newGrid);
        if (coord) this.updateMaptarget(coord, GRID_PRIORITY);
        else this.removeMaptarget(GRID_PRIORITY);
    }

    updateMaptarget(coord: [number, number], priority: number) {
        this.maptargets[priority] = coord;

        for (var i in this.maptargets) {
            var target = this.maptargets[i];
            if (target) {
                this.maptarget = target;
                return;
            }
        }

        this.maptarget = null;
    }

    removeMaptarget(priority: number) {
        this.updateMaptarget(null, priority);
    }

    sendCW(text) {
        console.log("Send CW:", text);
    }
}
