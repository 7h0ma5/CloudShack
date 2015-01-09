app.controller("StatusCtrl", function($scope, Profile) {
    $scope.profile = Profile.getActive();
    $scope.onAir = false;

    Profile.onChange(function() {
        $scope.profile = Profile.getActive();
    });

    $scope.toggle = function() {
        $scope.onAir = !$scope.onAir;
        $scope.status = $scope.onAir ? "On Air" : "Off Air";
    }

    $scope.toggle();
});
