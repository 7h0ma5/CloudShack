app.controller("ClusterCtrl", function($scope, $routeParams, Spots, Rig) {
    $scope.spots = Spots.get();

    $scope.tune = function(idx) {
        var spot = $scope.spots[idx];
        var freq = parseInt(spot.freq);
        Rig.setFrequency(Math.round(freq * 1000));
    };
});
