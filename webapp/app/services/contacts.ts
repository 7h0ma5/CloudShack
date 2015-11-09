import {Injectable} from "angular2/angular2";
import {Http, RequestOptionsArgs} from "angular2/http";

@Injectable()
export class ContactsService {
  constructor(public http: Http) {
      console.log("Contacts Service started");
  }

  get(options?: RequestOptionsArgs) : any {
      return this.http.get("/contacts", options)
        .map(res => res.json())
  }
}
