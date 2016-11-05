import { Component } from "@angular/core";
import { NgIf } from "@angular/common";
import { Http, Response } from "@angular/http";

declare var System:any;

@Component({
    selector: "app",
    templateUrl: "/app/app.component.html"
})
export class AppComponent {
    version: string = "?";
    toggleSidebar: boolean = false;

    constructor(public http: Http) {
        console.log("CloudShack is ready!");

        this.http.get("/version")
                 .map((res: Response) => res.text())
                 .subscribe(version => this.version = version);
    }
}
