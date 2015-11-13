import {Component, View, NgIf} from "angular2/angular2";
import {ROUTER_DIRECTIVES, RouteConfig, Route} from "angular2/router";
import {Clock} from "./clock";
import {ProfileSelect} from "./profile-select";
import {StatusSelect} from "./status-select";
import {HomePage} from "../pages/home";
import {LogbookPage} from "../pages/logbook";
import {NewContactPage} from "../pages/contact/new";
import {ShowContactPage} from "../pages/contact/show";

@Component({
    selector: "app"
})
@View({
    templateUrl: "/templates/layout.html",
    directives: [Clock, ProfileSelect, StatusSelect, NgIf, ROUTER_DIRECTIVES]
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
    version: string = "0.5";

    constructor() {
        console.log("CloudShack is ready!");
    }
}
