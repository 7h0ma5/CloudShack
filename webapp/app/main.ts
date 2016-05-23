import { provide } from "angular2/core";
import { bootstrap } from "angular2/platform/browser";
import { ROUTER_PROVIDERS } from "angular2/router";
import { HTTP_PROVIDERS } from "angular2/http";
import { LocationStrategy, HashLocationStrategy } from "angular2/platform/common";
import { AppComponent } from "./app.component";
import { FlashService, SocketService, StateService } from "./shared/index";


bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy}),
    HTTP_PROVIDERS,
    FlashService,
    SocketService,
    StateService
]);
