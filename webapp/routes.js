app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when("/contact/new", {
        templateUrl: "/templates/newcontact.html",
        controller: "NewContactCtrl"
    });

    $routeProvider.when("/contact/:id", {
        templateUrl: "/templates/showcontact.html",
        controller: "ShowContactCtrl"
    });

    $routeProvider.when("/profile/new", {
        templateUrl: "/templates/editprofile.html",
        controller: "EditProfileCtrl"
    });

    $routeProvider.when("/profile/:id", {
        templateUrl: "/templates/editprofile.html",
        controller: "EditProfileCtrl"
    });

    $routeProvider.when("/logbook", {
        templateUrl: "/templates/logbook.html",
        controller: "LogbookCtrl"
    });

    $routeProvider.when("/import", {
        templateUrl: "/templates/import.html",
        controller: "ImportCtrl"
    })

    $routeProvider.when("/cluster", {
        templateUrl: "/templates/cluster.html",
        controller: "ClusterCtrl"
    });

    $routeProvider.when("/settings", {
        templateUrl: "/templates/settings.html",
        controller: "SettingsCtrl"
    });

    $routeProvider.when("/", {
        templateUrl: "/templates/home.html",
        controller: "HomeCtrl"
    });

    $routeProvider.otherwise({
        redirectTo: "/"
    });

    //$locationProvider.html5Mode(true);
});
