import { NgModule }       from "@angular/core";
import { BrowserModule }  from "@angular/platform-browser";
import { FormsModule }    from "@angular/forms";
import { HttpModule }     from "@angular/http";

import { AppComponent } from "./app.component";
import { routing, appRoutingProviders } from "./app.routing";

import {
    ClockComponent,
    TickerComponent,
    FlashComponent,
    ProfileSelectComponent,
    StatusSelectComponent,
    ContactService,
    FlashService,
    ProfileService,
    RigService,
    RotService,
    SocketService,
    StateService,
    SharedModule
} from "./shared/index";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SharedModule,
    routing
  ],
  declarations: [
    AppComponent,
    ClockComponent,
    TickerComponent,
    FlashComponent,
    ProfileSelectComponent,
    StatusSelectComponent
  ],
  providers: [
    appRoutingProviders,
    ContactService,
    FlashService,
    ProfileService,
    RigService,
    RotService,
    SocketService,
    StateService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
