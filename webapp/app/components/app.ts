import {Component} from "angular2/core";
import {NgIf} from "angular2/common";
import {ROUTER_DIRECTIVES, RouteConfig, Route} from "angular2/router";
import {Http, Response} from "angular2/http";
import {Clock} from "./clock";
import {FlashView} from "./flash";
import {ProfileSelect} from "./profile-select";
import {StatusSelect} from "./status-select";
import {HomePage} from "../pages/home";
import {LogbookPage} from "../pages/logbook";
import {NewContactPage} from "../pages/contact/new";
import {ShowContactPage} from "../pages/contact/show";
import 'rxjs/Rx';

@Component({
    selector: "app",
    templateUrl: "/templates/layout.html",
    directives: [Clock, FlashView, ProfileSelect, StatusSelect, NgIf, ROUTER_DIRECTIVES]
})
@RouteConfig([
    new Route({path: "/", component: HomePage, name: "Home"}),
    new Route({path: "/logbook", component: LogbookPage, name: "Logbook"}),
    new Route({path: "/contact/new", component: NewContactPage, name: "NewContact"}),
    new Route({path: "/contact/:id", component: ShowContactPage, name: "ShowContact"}),
    new Route({path: "/contact/:id/edit", component: HomePage, name: "EditContact"}),
    new Route({path: "/profile/new", component: HomePage, name: "NewProfile"}),
    new Route({path: "/profile/:id", component: HomePage, name: "EditProfile"}),
    new Route({path: "/cluster", component: HomePage, name: "Cluster"}),
    new Route({path: "/import", component: HomePage, name: "Import"}),
    new Route({path: "/export", component: HomePage, name: "Export"}),
    new Route({path: "/settings", component: HomePage, name: "Settings"})
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
