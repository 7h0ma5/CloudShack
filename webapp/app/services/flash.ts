import {Output, EventEmitter} from "angular2/angular2";

export class FlashMessage {
    level: string;
    text: string;
}

export class Flash {
    @Output() public fire: EventEmitter<FlashMessage> = new EventEmitter();

    show(level: string, text: string) {
        var message: FlashMessage = {level: level, text: text};
        this.fire.next(message);
    }

    error(text: string) {
        this.show("error", text);
    }

    warning(text: string) {
        this.show("warning", text);
    }

    info(text: string) {
        this.show("info", text);
    }

    success(text: string) {
        this.show("success", text);
    }
}
