app.controller("EditContactCtrl", function($scope, $routeParams, Contact) {
    var id = $routeParams.id;
    $scope.contact = Contact.get({id: id});
});
