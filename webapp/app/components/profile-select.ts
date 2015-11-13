import {Component, View, NgIf, NgFor} from "angular2/angular2";
import {Router, RouterLink} from "angular2/router";

@Component({
    selector: "profile-select",
    template: `
        <a>
          <span *ng-if="activeProfile">{{activeProfile.name}}</span>
          <span *ng-if="!activeProfile">No Profile</span>&nbsp;
          <i class="fa fa-angle-down"></i>
        </a>
        <ul>
          <li *ng-for="#profile of profiles; #i = index">
            <a (click)="edit(i)"><i class="fa fa-pencil fg-lg"></i></a>
            <a (click)="activate(i)">{{profile.doc.name}}</a>
          </li>
          <li>
            <a [router-link]="['/NewProfile']">
              <i a class="fa fa-plus fa-lg"></i> New Profile
            </a>
          </li>
        </ul>
    `,
    directives: [NgIf, NgFor, RouterLink]
})
export class ProfileSelect {
    profiles: Array<Object> = [];
    activeProfile: Object = null;

    constructor() {
        this.profiles = [
            {doc: {name: "Test 1"}},
            {doc: {name: "Test 2"}},
        ]
    }

    activate(index) {

    }

    edit(index) {

    }
}
