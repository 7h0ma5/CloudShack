app.controller("TickerCtrl", function($scope, $timeout, Socket) {
    var timeout;

    Socket.on("dx-spot", function(spot) {
        $timeout.cancel(timeout);
        $scope.spot = spot;
        $scope.show = true;
        timeout = $timeout(function() {
            $scope.show = false;
        }, 8000);
    });
});
