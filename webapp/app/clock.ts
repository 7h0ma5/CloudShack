import {Component, DatePipe} from "angular2/angular2";

@Component({
    selector: 'clock',
    template: '{{time}}'
})
export class ClockComponent {
    time: String;
    datepipe: DatePipe;

    constructor() {
        this.time = "00:00:00";
        this.datepipe = new DatePipe();
        this.updateTime();
        setInterval(this.updateTime.bind(this), 1000);
    }

    updateTime() {
        var date = new Date();
        this.time = this.datepipe.transform(date, ["HH:mm:ss", "UTC"]);
    }
}
