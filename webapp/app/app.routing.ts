import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const appRoutes: Routes = [
    { path: "contacts", loadChildren: "./+contacts/contacts.module#ContactsModule" },
    { path: "profiles", loadChildren: "./+profiles/profiles.module#ProfilesModule" },
    { path: "settings", loadChildren: "./+settings/settings.module#SettingsModule" },
    { path: "", loadChildren: "./+home/home.module#HomeModule" }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(
    appRoutes,
    { useHash: true }
);
