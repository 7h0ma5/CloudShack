app.controller("EditProfileCtrl", function($scope, $routeParams, Profile) {
    if ($routeParams.id) {
        $scope.profile = Profile.get({id: $routeParams.id});
        $scope.new = false;
    }
    else {
        $scope.profile = {};
        $scope.new = true;
    }

    $scope.save = function() {
        if ($scope.new) {
            Profile.save($scope.profile);
        }
        else {
            Profile.update({id: $scope.profile._id, rev: $scope.profile._rev},
                           $scope.profile);
        } 
    }
});
