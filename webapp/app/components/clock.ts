import {Component} from "angular2/core";
import {DatePipe} from "angular2/common";
import {Observable} from "rxjs/Rx";

@Component({
    selector: "clock",
    template: "{{time | date: 'HH:mm:ss'}}"
})
export class Clock {
    time: Date = new Date();

    constructor() {
        Observable.interval(1000).subscribe(() => this.time = new Date());
    }
}
