app.controller("EditContactCtrl", function($scope, $routeParams, $location,
                                           Flash, Contact, Callbook)
{
    var id = $routeParams.id;

    Contact.get({id: id}, function(contact) {
        $scope.contact = contact;
        $scope.startDate = new Date(contact.start);
        $scope.endDate = new Date(contact.end);
    });

    $scope.save = function() {
        $scope.contact.start = $scope.startDate.toJSON();
        $scope.contact.end = $scope.endDate.toJSON();

        Contact.save($scope.contact, function(result) {
            Flash.success("Contact saved.");
            $location.path("/contact/" + id);
        }, function() {
            Flash.error("Failed to save the contact.");
        });
    };

    $scope.discard = function() {
        $location.path("/contact/" + id);
    };

    $scope.queryCallbook = function() {
        Callbook.get({"call": $scope.contact.call}, function(result) {
            angular.extend($scope.contact, result);
            Flash.success("Callbook information merged.");
        }, function() {
            Flash.error("Callbook query failed.");
        });
    };
});
