import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./+home/home.component";

const appRoutes: Routes = [
  // { path: "logbook", loadChildren: "./app/+contacts/contacts.list.component.js" },
  // { path: "map", loadChildren: "./app/+contacts/contacts.map.component" },
  // { path: "contact/new", loadChildren: "./app/+contacts/contacts.new.component" },
  // { path: "contact/:id", loadChildren: "./app/+contacts/contacts.show.component" },
  // { path: "contact/:id/edit", loadChildren: "./app/+contacts/contacts.edit.component" },
  // { path: "profile/new", loadChildren: "./app/+profiles/profiles.new.component" },
  // { path: "profile/:id", loadChildren: "./app/+contacts/profiles.edit.component" },
  // { path: "cluster", loadChildren: "./app/+cluster/cluster.component" },
  // { path: "import", loadChildren: "./app/+contacts/contacts.import.component" },
  // { path: "export", loadChildren: "./app/+contacts/contacts.export.component" },
  // { path: "settings", loadChildren: "./app/+settings/settings.component" },
  { path: "", component: HomeComponent }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
