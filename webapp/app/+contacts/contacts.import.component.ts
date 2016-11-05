import { Component } from "@angular/core";
import { Http, Response, URLSearchParams } from "@angular/http";
import { FlashService } from "../shared/index";

@Component({
    templateUrl: "/app/+contacts/contacts.import.component.html"
})
export class ContactsImportComponent {
    filesToUpload: Array<File> = null;
    dateRange: boolean = false;
    start: string = null;
    end: string = null;
    dxcc: boolean = true;
    profile: boolean = true;

    constructor(public http: Http, private flash: FlashService) {
        let now = (new Date()).toJSON().slice(0, 19);
        this.start = now;
        this.end = now;
    }

    import() {
        var params = new URLSearchParams();

        if (this.dateRange) {
            params.set("start", JSON.stringify(new Date(this.start)));
            params.set("end", JSON.stringify(new Date(this.end)));
        }

        params.set("dxcc", JSON.stringify(this.dxcc));
        params.set("profile", JSON.stringify(this.profile));

        let fileReader = new FileReader();
        fileReader.onload = event => this.upload(params, event.target["result"]);
        fileReader.readAsText(this.filesToUpload[0]);
    }

    upload(params, data) {
        this.http.post("/contacts/_adi?" + params.toString(), data)
            .map((res: Response) => res.json())
            .subscribe(result => {
                this.flash.success("Imported " + result["count"] + " contacts.");
            }, err => {
                this.flash.error("Import failed.");
            });
    }

    fileChangeEvent(fileInput: any){
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }
}
