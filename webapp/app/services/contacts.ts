import {Injectable} from "angular2/angular2";
import {Http, URLSearchParams} from "angular2/http";

@Injectable()
export class ContactsService {
    constructor(public http: Http) {
        console.log("Contacts Service started");
    }

    query(base: string, options?: Object) : string {
        if (!options) return base;
        var params = new URLSearchParams();
        for (var key in options) {
            params.set(key, JSON.stringify(options[key]));
        }
        return base + "?" + params.toString();
    }

    get(url: string, options?: Object) : any {
        var url = this.query(url, options);
        return this.http.get(url, options)
          .map(res => res.json())
    }

    all(options?: Object) : any {
        return this.get("/contacts", options);
    }

    byCall(options?: Object) : any {
        return this.get("/contacts/_view/byCall", options);
    }
}
