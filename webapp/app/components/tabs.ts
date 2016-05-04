import {Component, Input, ContentChildren, QueryList} from "angular2/core";
import {NgFor, NgClass} from "angular2/common";

@Component({
    selector: "tab",
    template: `<div [hidden]="!active"><ng-content></ng-content></div>`
})
export class Tab {
    @Input() title: string;
    @Input() active: boolean = false;
}

@Component({
    selector: "tabs",
    template: `
        <ul class="tab-list">
          <li *ngFor="#tab of tabs" [ngClass]="{'active': tab.active}">
            <a (click)="selectTab(tab)">{{tab.title}}</a>
          </li>
        </ul>
        <div class="tab-content"><ng-content></ng-content></div>
    `,
    directives: [NgFor, NgClass]
})
export class Tabs {
    @ContentChildren(Tab) tabs: QueryList<Tab>;

    selectTab(tab) {
        this.tabs.map(tab => tab.active = false);
        tab.active = true;
    }
}

export const TAB_DIRECTIVES = [Tab, Tabs];
