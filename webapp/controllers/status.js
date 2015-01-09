app.controller("StatusCtrl", function($scope) {
    $scope.onAir = false;

    $scope.toggle = function() {
        $scope.onAir = !$scope.onAir;
        $scope.status = $scope.onAir ? "On Air" : "Off Air";
    }

    $scope.toggle();
});
