app.controller("RigCtrl", function($scope, Socket) {
    $scope.freq = "--.---";
    $scope.mode = "---";

    Socket.on("rig_update", function(rig) {
        $scope.freq = parseFloat(rig.frequency/1e6).toFixed(4);
        $scope.mode = rig.mode;
    });

    $scope.power = function() {
        alert("Power!");
    };
});
