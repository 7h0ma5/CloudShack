import {Injectable} from "angular2/angular2";
import {Http, Response} from "angular2/http";

@Injectable()
export class DxccService {
    constructor(public http: Http) {

    }

    lookup(callsign: string) : any {
        return this.http.get("/dxcc/" + callsign)
          .map((res: Response) => res.json());
    }
}
