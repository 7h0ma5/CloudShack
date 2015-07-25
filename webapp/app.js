var app = angular.module("app", ["ngRoute", "ngResource", "ngAnimate", "cfp.hotkeys",
                                 "LocalStorageModule", "ngFileUpload"]);

app.config(function(hotkeysProvider, localStorageServiceProvider) {
    hotkeysProvider.includeCheatSheet = false;
    localStorageServiceProvider.setPrefix("CloudShack");
});

// this function is here to always initialize the rig and services
app.run(function($rootScope, CW, Rig) {
    $rootScope.version = CLOUDSHACK_VERSION;
    console.log("CloudShack is ready.");
});
