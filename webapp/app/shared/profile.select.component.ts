import { Component } from "angular2/core";
import { NgIf, NgFor } from "angular2/common";
import { Router, RouterLink } from "angular2/router";
import { ProfileService } from "./profile.service";
import { DROPDOWN_DIRECTIVES } from "./dropdown/index";

@Component({
    selector: "profile-select",
    template: `
        <div dropdown>
            <a dropdown-toggle>
              <span *ngIf="profileService.activeProfile">
                {{profileService.activeProfile?.name}}
              </span>
              <span *ngIf="!profileService.activeProfile">
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
    directives: [NgIf, NgFor, RouterLink, DROPDOWN_DIRECTIVES]
})
export class ProfileSelectComponent {
    profiles: Array<Object> = [];

    constructor(public profileService: ProfileService) {
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
