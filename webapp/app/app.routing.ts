import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const appRoutes: Routes = [
  // { path: "profile/new", loadChildren: "./app/+profiles/profiles.new.component" },
  // { path: "profile/:id", loadChildren: "./app/+contacts/profiles.edit.component" },
  { path: "settings", loadChildren: "./+settings/settings.module#SettingsModule" },
  { path: "contacts", loadChildren: "./+contacts/contacts.module#ContactsModule" },
  { path: "", loadChildren: "./+home/home.module#HomeModule" }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(
    appRoutes,
    { useHash: true }
);
