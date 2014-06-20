app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when("/contact/new", {
        templateUrl: "/partials/newcontact.html",
        controller: "NewContactCtrl"
    });

    $routeProvider.when("/contact/:id", {
        templateUrl: "/partials/editcontact.html",
        controller: "EditContactCtrl"
    });

    $routeProvider.when("/profile/new", {
        templateUrl: "/partials/editprofile.html",
        controller: "EditProfileCtrl"
    });

    $routeProvider.when("/profile/:id", {
        templateUrl: "/partials/editprofile.html",
        controller: "EditProfileCtrl"
    });

    $routeProvider.when("/logbook", {
        templateUrl: "/partials/logbook.html",
        controller: "LogbookCtrl"
    });

    $routeProvider.when("/cluster", {
        templateUrl: "/partials/cluster.html",
        controller: "ClusterCtrl"
    });

    $routeProvider.when("/", {
        templateUrl: "/partials/home.html"
    });

    $routeProvider.otherwise({
        redirectTo: "/"
    });

    //$locationProvider.html5Mode(true);
});
