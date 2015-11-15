import {Component, Directive, Inject, ElementRef} from "angular2/angular2";
import {Map, Icon, LatLng, Marker, marker, tileLayer, control} from "leaflet";

@Directive({
    selector: "worldmap",
    properties: ["maptarget"]
})
export class WorldMap {
    target: [number, number];
    map: Map;
    marker: Marker;

    constructor(@Inject(ElementRef) elementRef: ElementRef) {
        Icon.Default.imagePath = '/css/images';

        var offline = tileLayer("/images/map/{z}/{x}/{y}.png", {
            maxZoom: 4
        });

        var osm = tileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
            subdomains: ["1", "2", "3", "4"],
            maxZoom: 14,
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });

        var layers = {
            "Offline": offline,
            "MapQuest OSM": osm
        };

        this.map = new Map(elementRef.nativeElement, {
            center: new LatLng(51.505, -0.09),
            zoom: 2,
            layers: [offline]
        });

        control.layers(layers, []).addTo(this.map);

        this.marker = marker([0, 0]);
    }

    set maptarget(newTarget) {
        this.map.removeLayer(this.marker);

        if (!newTarget || newTarget.length != 2 || newTarget == this.target) return;
        this.target = newTarget;

        var pos = L.latLng(this.target[0], this.target[1]);
        if (!pos) return;


        this.marker.setLatLng(pos);
        this.marker.addTo(this.map);
        this.map.panTo(pos);
    }
}
