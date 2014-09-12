app.controller("ProfileSelectCtrl", function($scope, $location, $cookies, Profile) {
    function reload() {
        Profile.setActive(null);

        $scope.profiles = Profile.get({}, function(data) {
            if (!$cookies.profile) return;

            angular.forEach(data.rows, function(profile) {
                if (profile.id == $cookies.profile) {
                    Profile.setActive(profile.doc);
                }
            });

            $scope.activeProfile = Profile.getActive();
        });
    }

    $scope.activate = function(idx) {
        $scope.activeProfile = $scope.profiles.rows[idx].doc;
        Profile.setActive($scope.activeProfile);
        $cookies.profile = $scope.activeProfile._id;
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
