app.controller("ClusterCtrl", function($scope, $routeParams, Spots) {
    $scope.spots = Spots.get();
});
