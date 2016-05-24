import { Component } from "angular2/core";
import { NgIf, NgFor } from "angular2/common";
import { ContactService } from "../shared/index";

@Component({
    templateUrl: "/app/+home/home.component.html",
    directives: [NgIf, NgFor]
})
export class HomeComponent {
    qso_stats = {total: 0, year: 0, month: 0};
    modes: Array<[string, number]> = [];

    constructor(public api: ContactService) {
        this.reload();
    }

    reload() {
        var date = new Date();
        var year = date.getUTCFullYear().toString();
        var month = date.getUTCMonth() + 1;
        var month_str = month < 10 ?  "0" + month.toString() : month.toString();

        // Query total QSOs
        this.api.stats({group_level: 0}).subscribe(result => {
            this.qso_stats.total = result.rows.length ? result.rows[0].value : 0
        });

        // Query QSOs for this year
        var year_options = {
            group_level: 1,
            startkey: JSON.stringify([year]),
            endkey: JSON.stringify([year, {}])
        };

        this.api.stats(year_options).subscribe(result => {
            this.qso_stats.year = result.rows.length ? result.rows[0].value : 0;
        });

        // Query QSOs for this month
        var month_options = {
           group_level: 2,
           startkey: JSON.stringify([year, month_str]),
           endkey: JSON.stringify([year, month_str, {}])
        };

        this.api.stats(month_options).subscribe(result => {
            this.qso_stats.month = result.rows.length ? result.rows[0].value : 0;
        });

        // Query modes
        var mode_options = {
            group_level: 1,
            include_docs: false,
            descending: false
        };

        this.api.byMode(mode_options).subscribe(modes => {
            this.modes = [];
            for (var i in modes.rows) {
                var name = modes.rows[i].key[0];
                var count = modes.rows[i].value;
                this.modes.push([name, count]);
            }
        });
    }
}
