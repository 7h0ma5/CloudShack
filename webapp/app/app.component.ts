import { Component } from "angular2/core";
import { NgIf } from "angular2/common";
import { ROUTER_DIRECTIVES, RouteConfig, AsyncRoute, Route } from "angular2/router";
import { Http, Response } from "angular2/http";
import 'rxjs/Rx';

import { HomeComponent } from "./+home/home.component";

import {
    ClockComponent,
    TickerComponent,
    FlashComponent,
    ProfileSelectComponent,
    StatusSelectComponent
} from "./shared/index";

declare var System:any;

@Component({
    selector: "app",
    templateUrl: "/app/app.component.html",
    directives: [
        ClockComponent,
        TickerComponent,
        FlashComponent,
        ProfileSelectComponent,
        StatusSelectComponent,
        NgIf,
        ROUTER_DIRECTIVES
    ]
})
@RouteConfig([
    new AsyncRoute({path: "/", loader: () => System.import("+home/home.component").then(m => m.HomeComponent), name: "Home"}),
    new AsyncRoute({path: "/logbook", loader: () => System.import("+contacts/contacts.list.component").then(m => m.ContactsListComponent), name: "Logbook"}),
    new AsyncRoute({path: "/map", loader: () => System.import("+contacts/contacts.map.component").then(m => m.ContactsMapComponent), name: "Map"}),
    new AsyncRoute({path: "/contact/new", loader: () => System.import("+contacts/contacts.new.component").then(m => m.ContactsNewComponent), name: "NewContact"}),
    new AsyncRoute({path: "/contact/:id", loader: () => System.import("+contacts/contacts.show.component").then(m => m.ContactsShowComponent), name: "ShowContact"}),
    new AsyncRoute({path: "/contact/:id/edit", loader: () => System.import("+contacts/contacts.edit.component").then(m => m.ContactsEditComponent), name: "EditContact"}),
    new AsyncRoute({path: "/profile/new", loader: () => System.import("+profiles/profiles.new.component").then(m => m.ProfilesNewComponent), name: "NewProfile"}),
    new AsyncRoute({path: "/profile/:id", loader: () => System.import("+profiles/profiles.edit.component").then(m => m.ProfilesEditComponent), name: "EditProfile"}),
    new AsyncRoute({path: "/cluster", loader: () => System.import("+cluster/cluster.component").then(m => m.ClusterComponent), name: "Cluster"}),
    new AsyncRoute({path: "/import", loader: () => System.import("+contacts/contacts.import.component").then(m => m.ContactsImportComponent), name: "Import"}),
    new AsyncRoute({path: "/export", loader: () => System.import("+contacts/contacts.export.component").then(m => m.ContactsExportComponent), name: "Export"}),
    new AsyncRoute({path: "/settings", loader: () => System.import("+settings/settings.component").then(m => m.SettingsComponent), name: "Settings"})
])
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
