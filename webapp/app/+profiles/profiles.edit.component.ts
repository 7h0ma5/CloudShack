import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProfileService, FlashService } from "../shared/index";

@Component({
    templateUrl: "./profiles.edit.component.html"
})
export class ProfilesEditComponent {
    profile: Object = {};
    newProfile: boolean = true;

    constructor(
        route: ActivatedRoute,
        private api: ProfileService,
        private flash: FlashService
    ) {
        route.params.subscribe(params => {
            if ("id" in params) {
                this.api.get(params["id"]).subscribe(profile => {
                    this.newProfile = false;
                    this.profile = profile;
                });
            }
        });
    }

    saveProfile() {
        this.api.insert(this.profile).subscribe(result => {
            this.newProfile = false;
            this.profile["_id"] = result.id;
            this.profile["_rev"] = result.rev;
            this.flash.success("Profile saved.");
        }, err => {
            this.flash.error("Failed to save profile.");
        });

    }

    deleteProfile() {

    }
}
