app.controller("HomeCtrl", function($scope, Contact) {
    $scope.contactCount = 0;
    Contact.stats({group_level: 0}, function(stats) {
        $scope.contactCount = stats.rows[0].doc;
    });
});
