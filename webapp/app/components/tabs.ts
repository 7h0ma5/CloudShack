import {Component, View, Input, NgFor, NgClass} from "angular2/angular2";
import {Query, QueryList} from "angular2/angular2";

@Component({
    selector: "tab",
    inputs: ["title"]
})
@View({
    template: `
        <div [hidden]="!active">
          <ng-content></ng-content>
        </div>
    `
})
export class Tab {
    @Input() title: string;
    active: boolean = false;
}

@Component({
    selector: "tabs"
})
@View({
    template: `
        <ul class="tab-list">
          <li *ng-for="#tab of tabs" [ng-class]="{'active': tab.active}">
            <a (click)="selectTab(tab)">{{tab.title}}</a>
          </li>
        </ul>
        <div class="tab-content">
          <ng-content></ng-content>
        </div>
    `,
    directives: [NgFor, NgClass]
})
export class Tabs {
    tabs: QueryList<Tab>;

    constructor(@Query(Tab) tabs: QueryList<Tab>) {
        this.tabs = tabs;
        this.tabs.changes.subscribe(_ => {
            this.tabs.map(tab => tab.active = false);
            if (this.tabs.first) this.tabs.first.active = true;
        });
    }

    selectTab(tab) {
        this.tabs.map(tab => tab.active = false);
        tab.active = true;
    }
}

export const TAB_DIRECTIVES = [Tab, Tabs];
