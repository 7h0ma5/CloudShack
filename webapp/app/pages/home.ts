import {Component} from "angular2/angular2";

@Component({
    templateUrl: "/templates/home.html"
})
export class HomePage {
    qso_stats: Object;

    constructor() {
        this.qso_stats = {
            total: 123,
            year: 23,
            month: 3
        };
    }
}
