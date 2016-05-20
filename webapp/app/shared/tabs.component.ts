import { Component, Input, ContentChildren, QueryList } from "angular2/core";
import { NgFor, NgClass } from "angular2/common";

@Component({
    selector: "tab",
    template: `<div [hidden]="!active"><ng-content></ng-content></div>`
})
export class TabComponent {
    @Input() title: string;
    @Input() active: boolean = false;
}

@Component({
    selector: "tabs",
    template: `
        <ul class="tab-list">
          <li *ngFor="let tab of tabs" [ngClass]="{'active': tab.active}">
            <a (click)="selectTab(tab)">{{tab.title}}</a>
          </li>
        </ul>
        <div class="tab-content"><ng-content></ng-content></div>
    `,
    directives: [NgFor, NgClass]
})
export class TabsComponent {
    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

    selectTab(tab) {
        this.tabs.map(tab => tab.active = false);
        tab.active = true;
    }
}

export const TAB_DIRECTIVES = [TabComponent, TabsComponent];
