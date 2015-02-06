app.controller("ShowContactCtrl", function($scope, $routeParams, $window,
                                           $location, Flash, Contact)
{
    var id = $routeParams.id;
    $scope.contact = Contact.get({id: id});

    $scope.qrz = function() {
        $window.open("http://www.qrz.com/db/" + $scope.contact.call);
    };

    $scope.edit = function() {
        $location.path("/contact/" + id + "/edit");
    };

    $scope.delete = function() {
        var msg = "Delete contact with " + $scope.contact.call + "?";
        var permission = $window.confirm(msg);

        if (!permission) return;

        var id = $scope.contact._id;
        var rev = $scope.contact._rev;

        Contact.delete({id: id, rev: rev}, function(res) {
            Flash.success("Contact with " + $scope.contact.call + " deleted.");
            $location.path("/logbook");
        }, function(res) {
            Flash.error("Deletion failed.");
        });
    };
});
