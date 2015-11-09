import {Component, View, bootstrap, provide} from "angular2/angular2";
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from "angular2/router";
import {ROUTER_DIRECTIVES, RouteConfig, Router, Location, Route} from "angular2/router";
import {ClockComponent} from "./clock";
import {HomePage} from "./pages/home";

@Component({
    selector: "app"
})
@View({
    templateUrl: "/templates/layout.html",
    directives: [ClockComponent, ROUTER_DIRECTIVES]
})
@RouteConfig([
    new Route({path: "/", component: HomePage, as: "Home"}),
    new Route({path: "/logbook", component: HomePage, as: "Logbook"}),
    new Route({path: "/contact/new", component: HomePage, as: "NewContact"}),
    new Route({path: "/cluster", component: HomePage, as: "Cluster"}),
    new Route({path: "/import", component: HomePage, as: "Import"}),
    new Route({path: "/export", component: HomePage, as: "Export"}),
    new Route({path: "/settings", component: HomePage, as: "Settings"})
])
class AppComponent {
    router: Router;
    location: Location;

    constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;
        console.log("CloudShack is ready!", this.router, this.location);
    }
    /*
    getLinkStyle(path) {
        return this.location.path() === path;
    }
    */
}

bootstrap(AppComponent,[ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy})]);
