app.controller("ClusterCtrl", function($scope, $routeParams, Spots, Rig) {
    $scope.spots = Spots.get();

    $scope.tune = function(idx) {
        var spot = $scope.spots[idx];
        Rig.setFrequency(spot.freq);
    };
});
