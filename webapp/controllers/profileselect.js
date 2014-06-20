app.controller("ProfileSelectCtrl", function($scope, $location) {
    $scope.profiles = [
        {"name": "DL0ABC", "_id": "1"},
        {"name": "DL0DEF", "_id": "2"}
    ];

    $scope.activeProfile = {
        "name": "DL0ABC"
    };

    $scope.showDropdown = false;

    $scope.toggleDropdown = function() {
        $scope.showDropdown = !$scope.showDropdown;
    };

    $scope.activate = function(idx) {
        $scope.activeProfile = $scope.profiles[idx];
        $scope.showDropdown = false;
    };

    $scope.edit = function(idx) {
        var profile = $scope.profiles[idx];
        $location.path("/profile/" + profile._id);
    };
});
