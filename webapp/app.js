var app = angular.module("app", ["ngRoute", "ngResource", "ngAnimate", "cfp.hotkeys",
                                 "LocalStorageModule", "angularFileUpload"]);

app.config(function(hotkeysProvider, localStorageServiceProvider) {
    hotkeysProvider.includeCheatSheet = false;
    localStorageServiceProvider.setPrefix("CloudShack");
});

// this function is here to always initialize the rig service
app.run(function(Rig) {
    console.log("CloudShack is ready.");
});
