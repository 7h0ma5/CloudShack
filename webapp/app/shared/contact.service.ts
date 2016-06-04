import { Injectable } from "angular2/core";
import { Http, Response, URLSearchParams } from "angular2/http";

@Injectable()
export class ContactService {
    constructor(public http: Http) {}

    insert(doc) : any {
        return this.http.post("/contacts", JSON.stringify(doc))
            .map((res: Response) => res.json());
    }

    query(base: string, options?: Object) : string {
        if (!options) return base;
        var params = new URLSearchParams();
        for (var key in options) {
            params.set(key, String(options[key]));
        }
        return base + "?" + params.toString();
    }

    get_req(url: string, options?: Object) : any {
        var url = this.query(url, options);
        return this.http.get(url)
          .map((res: Response) => res.json());
    }

    get(id: string) : any {
        return this.get_req("/contacts/" + id);
    }

    all(options?: Object) : any {
        return this.get_req("/contacts", options);
    }

    byCall(options?: Object) : any {
        return this.get_req("/contacts/_view/byCall", options);
    }

    byMode(options?: Object) : any {
        return this.get_req("/contacts/_view/byMode", options);
    }

    stats(options?: Object) : any {
        return this.get_req("/contacts/_stats", options);
    }

    dxccCount() : any {
        return this.get_req("/contacts/_dxcc_count");
    }

    delete(id: string, rev: string) : any {
        var url = this.query("/contacts/" + id, {rev: rev});
        return this.http.delete(url);
    }

    previousContacts(call: string) : any {
        var options = {
            startkey: JSON.stringify([call]),
            endkey: JSON.stringify([call, {}]),
            descending: false
        };

        return this.byCall(options);
    }
}
