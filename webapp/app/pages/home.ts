import {Component, View, NgIf} from "angular2/angular2";

@Component({})
@View({
    templateUrl: "/templates/home.html",
    directives: [NgIf]
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
