var dateToUTC = function(local) {
    return new Date(local.getUTCFullYear(), local.getUTCMonth(),
                    local.getUTCDate(), local.getUTCHours(),
                    local.getUTCMinutes(), local.getUTCSeconds(), 0);
}

app.controller("NewContactCtrl", function($scope, $filter, $window, Flash,
                                          Contact, Callbook, Dxcc, Data)
{
    $scope.modes = Data.get("modes");
    console.log($scope.modes);

    $scope.resetStart = function() {
        var utc = dateToUTC(new Date());
        $scope.startDate = $filter("date")(utc, "yyyy-MM-ddTHH:mm:ss");
    };

    $scope.resetEnd = function() {
        var utc = dateToUTC(new Date());
        $scope.endDate = $filter("date")(utc, "yyyy-MM-ddTHH:mm:ss");
    };

    $scope.reset = function() {
        $scope.resetStart();
        $scope.resetEnd();

        $scope.contact = null;
        $scope.callbook = null;
        $scope.dxcc = null;
    };

    $scope.reset();

    $scope.save = function() {
        var start = new Date(Date.parse($scope.startDate));
        var end = new Date(Date.parse($scope.endDate));
        $scope.contact["start"] = start.toJSON();
        $scope.contact["end"] = end.toJSON();

        Contact.save($scope.contact, function(res) {
            Flash.success("Contact with " + $scope.contact.call + " saved.");
            $scope.reset();
        }, function(res) {
            Flash.error("Failed to save contact.")
        });

    };

    $scope.qrz = function() {
        $window.open("http://www.qrz.com/db/" + $scope.contact.call);
    };

    $scope.$watch("contact.call", function(newValue, oldValue) {
        if (!newValue) return;

        var uppercase = newValue.toUpperCase();
        if (uppercase != newValue) {
            $scope.contact.call = uppercase;
            return;
        }

        Dxcc.get({"call": newValue}, function(result) {
            console.log("got dxcc");
            $scope.dxcc = result;
        });

        if (newValue.length < 3) return;

        Callbook.get({"call": newValue}, function(result) {
            $scope.callbook = result;
        });
    });
});
