import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "angular2/core";
import { ContactService } from "../shared/index";
import { Map, Icon, LatLng, LatLngBounds, LayerGroup, Rectangle, tileLayer, control } from "leaflet";
import { BANDS } from "../lib/constants";
import { grid_to_rect } from "../lib/geo";

@Component({
    templateUrl: "/app/+contacts/contacts.map.component.html"
})
export class ContactsMapComponent implements AfterViewInit, OnDestroy {
    @ViewChild("mapView") mapView: ElementRef;

    map: Map;
    rects: LayerGroup<Rectangle> = new LayerGroup<Rectangle>();

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
            let bounds = new LatLngBounds(grid_to_rect(grid));

            let rect = new Rectangle(bounds, {
                color: "#ff0000",
                stroke: false,
                clickable: false,
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

        this.map = new Map(this.mapView.nativeElement, {
            center: new LatLng(20, 0),
            zoom: 2,
            layers: [offline]
        });

        control.layers(layers, []).addTo(this.map);

        this.rects.addTo(this.map);

        this.redraw();
    }
}
