app.controller("TickerCtrl", function($scope, $timeout, Socket) {
    var timeout = null;

    function hide() {
        $scope.show = false;
        timeout = null;
    }

    function show() {
        $scope.show = true;
    }

    Socket.on("dx_spot", function(spot) {
        if (!timeout) {
            $scope.spot = spot;
            show();
            timeout = $timeout(hide, 8000);
        }
    });
});
