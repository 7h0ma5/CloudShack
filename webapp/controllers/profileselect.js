app.controller("ProfileSelectCtrl", function($scope, $location, localStorageService, Profile) {
    function reload() {
        Profile.setActive(null);

        $scope.profiles = Profile.get({}, function(data) {
            var savedProfile = localStorageService.get("profile");
            if (!savedProfile) return;

            angular.forEach(data.rows, function(profile) {
                if (profile.id == savedProfile) {
                    Profile.setActive(profile.doc);
                }
            });
        });
    }

    $scope.activate = function(idx) {
        var profile = $scope.profiles.rows[idx].doc;
        Profile.setActive(profile);
        localStorageService.set("profile", profile._id);
    };

    $scope.edit = function(idx) {
        var profile = $scope.profiles.rows[idx];
        $location.path("/profile/" + profile.id);
    };

    Profile.onUpdate(function() {
        reload();
    });

    reload();
});
