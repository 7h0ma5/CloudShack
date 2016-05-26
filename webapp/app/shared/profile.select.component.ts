import { Component } from "angular2/core";
import { Router, RouterLink } from "angular2/router";
import { ProfileService } from "./profile.service";
import { StateService } from "./state.service";
import { DROPDOWN_DIRECTIVES } from "./dropdown/index";

@Component({
    selector: "profile-select",
    template: `
        <div dropdown>
            <a dropdown-toggle>
              <span *ngIf="state.profile['name']">
                {{state.profile.name}}
              </span>
              <span *ngIf="!state.profile['name']">
                No Profile
              </span>&nbsp;
              <i class="fa fa-angle-down"></i>
            </a>
            <ul>
              <li *ngFor="let profile of profiles; let i = index">
                <a (click)="edit(i)"><i class="fa fa-pencil fa-lg fa-fw"></i></a>
                <a (click)="activate(i)">{{profile.doc.name}}</a>
              </li>
              <li>
                <a [routerLink]="['/NewProfile']">
                  <i class="fa fa-plus fa-lg fa-fw"></i> New Profile
                </a>
              </li>
            </ul>
        </div>
    `,
    directives: [RouterLink, DROPDOWN_DIRECTIVES]
})
export class ProfileSelectComponent {
    profiles: Array<Object> = [];

    constructor(private profileService: ProfileService,
                private state: StateService)
    {
        console.log(this);
        profileService.all().subscribe(result => {
            this.profiles = result.rows;
        }, err => {
            this.profiles = [];
        });
    }

    activate(index) {
        let profile_id = this.profiles[index]["id"];
        if (profile_id) {
            this.profileService.activate(profile_id).subscribe();
        }
    }

    edit(index) {

    }
}
