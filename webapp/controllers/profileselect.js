app.controller("ProfileSelectCtrl", function($scope, $location, $cookies, Profile) {
    $scope.activeProfile = null;

    $scope.profiles = Profile.get({}, function() {
        if (!$cookies.profile) return;

        angular.forEach($scope.profiles.rows, function(profile) {
            if (profile.id == $cookies.profile) {
                $scope.activeProfile = profile.doc;
            }
        });
    });

    $scope.activate = function(idx) {
        $scope.activeProfile = $scope.profiles.rows[idx].doc;
        $cookies.profile = $scope.activeProfile._id;
    };

    $scope.edit = function(idx) {
        var profile = $scope.profiles.rows[idx];
        $location.path("/profile/" + profile.id);
    };
});
