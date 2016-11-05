import { Component } from "@angular/core";
import { TAB_DIRECTIVES } from "../shared/index";
import { Http, Response } from "@angular/http";

@Component({
    templateUrl: "/app/+settings/settings.component.html",
    providers: [TAB_DIRECTIVES]
})
export class SettingsComponent {
    config = {
        cluster: {},
        hamqth: {},
        database: {},
        sync: {},
        wsjt: {}
    };

    constructor(public http: Http) {
        this.http.get("/config")
            .map((res: Response) => res.json())
            .subscribe(result => {
                Object.assign(this.config, result);
                console.log(result);
            }, error => {
                console.log("Failed to fetch config.");
            });
    }

    save() {
        this.http.post("/config", JSON.stringify(this.config))
            .subscribe(result => {
                console.log("Config saved.")
            }, error => {
                console.log("Failed to save contact.");
            })
    }
}
