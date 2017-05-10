import "@angular/platform-browser";
import "@angular/platform-browser-dynamic";
import "@angular/core";
import "@angular/common";
import "@angular/http";
import "@angular/router";
import "@angular/forms";

import "rxjs";
import "leaflet";

L.Icon.Default.imagePath = ".";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
