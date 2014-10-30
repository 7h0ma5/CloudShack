var app = angular.module("app", ["ngRoute", "ngResource", "ngAnimate", "ngCookies",
                                 "angularFileUpload", "cfp.hotkeys"]);

app.config(function(hotkeysProvider) {
    hotkeysProvider.includeCheatSheet = false;
});

// this function is here to always initialize the rig service
app.run(function(Rig) {
    console.log("CloudShack is ready.");
});
