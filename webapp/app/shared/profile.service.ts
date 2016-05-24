import { Injectable } from "angular2/core";
import { Http, Response, URLSearchParams } from "angular2/http";
import { StateService } from "./state.service";

@Injectable()
export class ProfileService {
    activeProfile: any = null;

    constructor(public http: Http, private stateService: StateService) {
        stateService.stateChange.subscribe(newState => {
            if (newState["profile"]) this.activeProfile = newState["profile"];
        })
        this.activeProfile = stateService.state["profile"] || null;
    }

    insert(doc) : any {
        return this.http.post("/profiles", JSON.stringify(doc))
            .map((res: Response) => res.json());
    }

    get(id: string) : any {
        return this.http.get("/profiles/" + id)
            .map((res: Response) => res.json());
    }

    all(options?: Object) : any {
        return this.http.get("/profiles")
            .map((res: Response) => res.json());
    }

    delete(id: string, rev: string) : any {
        var url = this.query("/profiles/" + id, {rev: rev});
        return this.http.delete(url);
    }

    activate(id: string) : any {
        return this.http.post("/profiles/activate", id)
            .map((res: Response) => res.json())
    }

    query(base: string, options?: Object) : string {
        if (!options) return base;
        var params = new URLSearchParams();
        for (var key in options) {
            params.set(key, String(options[key]));
        }
        return base + "?" + params.toString();
    }
}
