import { NgModule }       from "@angular/core";
import { BrowserModule }  from "@angular/platform-browser";
import { FormsModule }    from "@angular/forms";
import { HttpModule }     from "@angular/http";

import { AppComponent } from "./app.component";
import { routing, appRoutingProviders } from "./app.routing";
import { HomeComponent } from "./+home/home.component";

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
    SocketService,
    StateService
} from "./shared/index";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  declarations: [
    HomeComponent,
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
    SocketService,
    StateService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
