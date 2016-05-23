import { Component } from "angular2/core";
import { Control, NgIf, NgFor, FORM_DIRECTIVES } from "angular2/common";
import { Http, Response } from "angular2/http";
import { Observable } from "rxjs/Rx";
import { MODES, CONTESTS } from "../lib/constants";
import { coord_distance, coord_bearing, grid_to_coord } from "../lib/geo";

import {
    ContactService,
    FlashService,
    TAB_DIRECTIVES,
    UppercaseDirective,
    WorldMapComponent
} from "../shared/index";

const GRID_PRIORITY: number = 0;
const CALLBOOK_PRIORITY: number = 1;
const DXCC_PRIORITY: number = 2;

@Component({
    providers: [ContactService],
    templateUrl: "/app/+contacts/contacts.new.component.html",
    directives: [
        NgIf, NgFor, FORM_DIRECTIVES,
        WorldMapComponent,
        UppercaseDirective,
        TAB_DIRECTIVES
    ]
})
export class ContactsNewComponent {
    contact: Object = {};
    dxcc: Object = null;
    callbook: Object = null;

    startDate: string = null;
    endDate: string = null;

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
        public flash: FlashService,
        public http: Http
    )
    {
        this.callsign.valueChanges
            .filter((val: string) => val && val.length > 0)
            .debounceTime(200)
            .map(encodeURIComponent)
            .switchMap((val: string) => this.http.get("/dxcc/" + val))
            .catch((err, caught) => { this.resetDxcc(); return caught; })
            .map((res: Response) => res.json())
            .subscribe((dxcc: any) => this.updateDxcc(dxcc));

        this.callsign.valueChanges
            .filter((val: string) => val && val.length > 2)
            .debounceTime(400)
            .map(encodeURIComponent)
            .switchMap((val: string) => this.http.get("/callbook/" + val))
            .catch((err, caught) => { this.resetCallbook(); return caught; })
            .map((res: Response) => res.json())
            .subscribe((callbook: any) => this.updateCallbook(callbook));

        this.mode.valueChanges
            .debounceTime(10)
            .subscribe((mode: string) => this.updateMode(mode));

        this.gridsquare.valueChanges
            .debounceTime(10)
            .subscribe((grid: string) => this.updateGridsquare(grid));

        this.reset();
    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    save() {
        this.contact["start"] = new Date(this.startDate);
        this.contact["end"] = new Date(this.endDate);
        console.log(this.contact);
        this.api.insert(this.contact).subscribe(result => {
            this.flash.success("Contact saved.");
        }, err => {
            this.flash.error("Failed to save contact.");
        });

    }

    reset() {
        this.resetDxcc();
        this.resetStart();
        this.resetEnd();
        this.contact = {};
    }

    resetStart() {
        var now = (new Date()).toJSON().slice(0, 19);
        this.startDate = now;
    }

    resetEnd() {
        var now = (new Date()).toJSON().slice(0, 19);
        this.endDate = now;
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

    resetCallbook() {

    }

    updateCallbook(callbook) {
      console.log(callbook)
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
