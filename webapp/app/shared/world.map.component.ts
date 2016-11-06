import { Component, Directive, Inject, Input, ElementRef, OnDestroy } from "@angular/core";
import { Map, Icon, LatLng, Marker, marker, tileLayer, control } from "leaflet";
import * as L from "leaflet";

@Directive({
    selector: "worldmap"
})
export class WorldMapComponent implements OnDestroy {
    target: [number, number];
    map: L.Map;
    marker: L.Marker;

    constructor(@Inject(ElementRef) elementRef: ElementRef) {
        var offline = L.tileLayer("/images/map/{z}/{x}/{y}.png", {
            maxZoom: 4
        });

        var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 14,
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        });

        var layers = {
            "Offline": offline,
            "OpenStreetMap": osm
        };

        this.map = L.map(elementRef.nativeElement, {
            center: L.latLng(51.505, -0.09),
            zoom: 2,
            layers: [offline]
        });

        control.layers(layers).addTo(this.map);

        this.marker = marker([0, 0]);
    }

    ngOnDestroy() {
        this.map.remove();
    }

    ngAfterViewInit() {
        this.map.invalidateSize(false);
    }

    @Input("maptarget")
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
