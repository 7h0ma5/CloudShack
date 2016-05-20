import { Component } from "angular2/core";
import { DatePipe } from "angular2/common";
import { Observable } from "rxjs/Rx";

@Component({
    selector: "clock",
    template: "{{time | date: 'HH:mm:ss'}}"
})
export class ClockComponent {
    time: Date;

    constructor() {
        this.updateTime();
        Observable.interval(1000).subscribe(() => this.updateTime());
    }

    updateTime() {
        var now = new Date();
        var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(),
                               now.getUTCDate(),  now.getUTCHours(),
                               now.getUTCMinutes(), now.getUTCSeconds());
        this.time = now_utc;
    }
}
