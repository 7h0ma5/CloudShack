import { Component, ViewChild, ElementRef, Renderer, AfterViewInit, HostListener } from "angular2/core";
import { Control } from "angular2/common";
import { Http, Response } from "angular2/http";
import { Observable } from "rxjs/Rx";
import { MODES, CONTESTS } from "../lib/constants";
import { coord_distance, coord_bearing, grid_to_coord } from "../lib/geo";

import {
    ContactService,
    StateService,
    FlashService,
    WorldMapComponent,
    SmartInputDirective,
    UppercaseDirective,
    TAB_DIRECTIVES,
    DROPDOWN_DIRECTIVES
} from "../shared/index";

const RETAIN_FIELDS: [string] = ["freq", "mode", "submode", "tx_pwr"];

const GRID_PRIORITY: number = 0;
const CALLBOOK_PRIORITY: number = 1;
const DXCC_PRIORITY: number = 2;

@Component({
    templateUrl: "/app/+contacts/contacts.new.component.html",
    directives: [
        WorldMapComponent,
        SmartInputDirective,
        UppercaseDirective,
        TAB_DIRECTIVES,
        DROPDOWN_DIRECTIVES
    ]
})
export class ContactsNewComponent implements AfterViewInit {
    @ViewChild("callsignInput") callsignInput: ElementRef;

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
    distance: number = null;
    bearing: number = null;

    modes = MODES;
    submodes = null;
    rst = "";
    contests = CONTESTS;

    constructor(
        private renderer: Renderer,
        private api: ContactService,
        private state: StateService,
        private flash: FlashService,
        private http: Http
    )
    {
        this.callsign.valueChanges
            .filter((val: string) => val && val.length > 0)
            .debounceTime(200)
            .map(encodeURIComponent)
            .switchMap((val: string) => this.http.get("/dxcc/" + val))
            .catch((err, caught) => { this.resetDxcc(); return caught; })
            .map((res: Response) => res.json())
            .subscribe(this.updateDxcc.bind(this));

        this.callsign.valueChanges
            .filter((val: string) => val && val.length > 2)
            .debounceTime(400)
            .map(encodeURIComponent)
            .switchMap((val: string) => this.http.get("/callbook/" + val))
            .catch((err, caught) => { this.resetCallbook(); return caught; })
            .map((res: Response) => res.json())
            .subscribe(this.updateCallbook.bind(this));

        this.mode.valueChanges
            .debounceTime(10)
            .subscribe(this.updateMode.bind(this));

        this.gridsquare.valueChanges
            .debounceTime(10)
            .subscribe(this.updateGridsquare.bind(this));

        this.state.rigChange
            .subscribe(this.rigChange.bind(this));

        this.contact = state.log || {};
    }

    ngAfterViewInit() {
        // BUGFIX: https://github.com/angular/angular/issues/6005
        setTimeout(_ => this.reset());
    }

    qrz() {
        window.open("http://www.qrz.com/db/" + this.contact["call"]);
    }

    save() {
        this.contact["start"] = new Date(this.startDate);
        this.contact["end"] = new Date(this.endDate);

        this.api.insert(this.contact).subscribe(result => {
            this.flash.success("Contact saved.");
            this.reset();
        }, err => {
            this.flash.error("Failed to save contact.");
        });
    }

    reset() {
        this.resetCallbook();
        this.resetDxcc();
        this.resetStart();
        this.resetEnd();

        let contact = {};

        // Carry over the fields defined by RETAIN_FIELDS
        for (let field of RETAIN_FIELDS) {
            let value = this.contact[field];
            if (value) contact[field] = value;
        }

        this.contact = contact;

        // Set focus to callsign input
        let callsignInput = this.callsignInput.nativeElement;
        this.renderer.invokeElementMethod(callsignInput, "focus", []);
    }

    resetStart() {
        let now = (new Date()).toJSON().slice(0, 19);
        this.startDate = now;
    }

    resetEnd() {
        let now = (new Date()).toJSON().slice(0, 19);
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
        this.callbook = null;
        this.removeMaptarget(CALLBOOK_PRIORITY);
    }

    updateCallbook(callbook) {
        console.log(callbook);
        this.callbook = callbook;

        if (callbook["gridsquare"]) {
            let coord = grid_to_coord(callbook["gridsquare"]);
            this.updateMaptarget(coord, CALLBOOK_PRIORITY);
        }
        else {
            this.removeMaptarget(CALLBOOK_PRIORITY);
        }
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
        let coord = grid_to_coord(newGrid);
        if (coord) this.updateMaptarget(coord, GRID_PRIORITY);
        else this.removeMaptarget(GRID_PRIORITY);
    }

    updateMaptarget(coord: [number, number], priority: number) {
        this.maptargets[priority] = coord;

        for (var i in this.maptargets) {
            let target = this.maptargets[i];
            if (target) {
                this.maptarget = target;
                this.updateDistance(target);
                return;
            }
        }

        this.distance = null;
        this.bearing = null;
        this.maptarget = null;
    }

    updateDistance(target) {
        let profile = this.state.profile["fields"];
        if (profile && profile["my_gridsquare"]) {
            let myCoord = grid_to_coord(profile["my_gridsquare"]);
            this.distance = coord_distance(myCoord, target);
            this.bearing = coord_bearing(myCoord, target);
        }
        else {
            this.bearing = null;
            this.distance = null;
        }
    }

    removeMaptarget(priority: number) {
        this.updateMaptarget(null, priority);
    }

    rigChange(rig) {
        if (rig && rig["freq"]) {
            this.contact["freq"] = rig["freq"].toFixed(3);
        }
    }

    sendCW(text) {
        console.log("Send CW:", text);
    }

    @HostListener("keydown.alt.w", ["$event"])
    resetShortcut(event) {
        this.reset();
        event.preventDefault();
    }

    @HostListener("keydown.control.s", ["$event"])
    saveShortcut(event) {
        this.save();
        event.preventDefault();
    }
}
