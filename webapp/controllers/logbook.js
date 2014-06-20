app.controller("LogbookCtrl", function($scope, $location, Contact) {
    $scope.reload = function() {
        $scope.contacts = Contact.get({descending: true, limit: 10});
    };

    $scope.edit = function(idx) {
        var contact = $scope.contacts.rows[idx];
        $location.path("/contact/" + contact.value._id);
    };

    $scope.delete = function(idx) {
        var contact = $scope.contacts.rows[idx];

        var id = contact.value._id;
        var rev = contact.value._rev;

        Contact.delete({id: id, rev: rev}, function(result) {
            $scope.reload();
        });
    };

    $scope.reload();
});
