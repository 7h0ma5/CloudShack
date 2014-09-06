var app = angular.module("app", ["ngRoute", "ngResource", "ngAnimate", "ngCookies",
                                 "angularFileUpload", "cfp.hotkeys"]);

app.config(function(hotkeysProvider) {
    hotkeysProvider.includeCheatSheet = false;
});

// this function is also here to always initialize the rig service
app.run(function(Rig, $rootScope, dateFilter) {
    $rootScope.dateToUTC = function(local) {
        return new Date(local.getUTCFullYear(), local.getUTCMonth(),
                        local.getUTCDate(), local.getUTCHours(),
                        local.getUTCMinutes(), local.getUTCSeconds(), 0);
    }

    $rootScope.dateToIso = function(date) {
        return dateFilter(date, "yyyy-MM-ddTHH:mm:ss");
    }

    console.log("CloudShack is ready.");
});
