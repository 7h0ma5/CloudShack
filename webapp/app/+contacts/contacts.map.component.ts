import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
import { ContactService } from "../shared/index";
import * as L from "leaflet";
import { BANDS } from "../lib/constants";
import { grid_to_rect } from "../lib/geo";

@Component({
    templateUrl: "./contacts.map.component.html"
})
export class ContactsMapComponent implements AfterViewInit, OnDestroy {
    @ViewChild("mapView") mapView: ElementRef;

    map: L.Map;
    rects: L.LayerGroup = L.layerGroup([]);

    grids: [any];

    bandFilter: string;
    bands = BANDS;

    constructor(public api: ContactService) {
        this.api.byGrid().subscribe((res) => {
            this.grids = res.rows;
            this.redraw();
        });
    }

    redraw() {
        if (!this.map || !this.grids) return;

        this.rects.clearLayers();

        for (let row of this.grids) {
            if (this.bandFilter && !(this.bandFilter in row.value)) continue;

            let grid = row.key.join("");

            let rect = L.rectangle(grid_to_rect(grid), {
                color: "#ff0000",
                stroke: false,
                interactive: false,
                fillOpacity: 0.4
            });

            this.rects.addLayer(rect);
        }
    }

    onBandFilterChange() {
        this.redraw();
    }

    ngOnDestroy() {
        this.map.remove();
    }

    ngAfterViewInit() {
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

        this.map = L.map(this.mapView.nativeElement, {
            center: L.latLng(20, 0),
            zoom: 2,
            layers: [offline]
        });

        L.control.layers(layers).addTo(this.map);

        this.rects.addTo(this.map);

        this.redraw();
    }
}
