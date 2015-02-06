app.controller("EditContactCtrl", function($scope, $routeParams, $location,
                                           Flash, Contact, Callbook)
{
    var id = $routeParams.id;
    $scope.contact = Contact.get({id: id});

    $scope.save = function() {
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
