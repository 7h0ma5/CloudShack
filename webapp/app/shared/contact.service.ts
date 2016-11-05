import { Injectable } from "@angular/core";
import { Http, Response, URLSearchParams } from "@angular/http";

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
        var view_options = {
            descending: true,
            include_docs: true,
            limit: 20
        };

        Object.assign(view_options, options);

        return this.get_req("/contacts/_view/byCall", view_options);
    }

    byMode(options?: Object) : any {
        var view_options = {
            group_level: 1
        };

        Object.assign(view_options, options);

        return this.get_req("/contacts/_view/byMode", view_options);
    }

    byGrid(options?: Object) : any {
        var view_options = {
            group_level: 2
        };

        Object.assign(view_options, options);

        return this.get_req("/contacts/_view/byGrid", view_options);
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
