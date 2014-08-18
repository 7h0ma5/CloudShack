var dateToUTC = function(local) {
    return new Date(local.getUTCFullYear(), local.getUTCMonth(),
                    local.getUTCDate(), local.getUTCHours(),
                    local.getUTCMinutes(), local.getUTCSeconds(), 0);
}

app.controller("NewContactCtrl", function($scope, $filter, $window, hotkeys, Flash,
                                          Contact, Callbook, Dxcc, Data, Rig)
{
    $scope.rig = Rig;
    $scope.modes = Data.get("modes");

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

        Dxcc.get({"call": newValue}, function(result) {
            console.log("got dxcc");
            $scope.dxcc = result;
        });

        if (newValue.length < 3) return;

        Callbook.get({"call": newValue}, function(result) {
            $scope.callbook = result;
        });
    });

    $scope.qsl_rcvd = [
        {id: "N", name: "No"},
        {id: "Y", name: "Yes"},
        {id: "R", name: "Requested"},
        {id: "I", name: "Invalid"}
    ];

    $scope.qsl_sent = [
        {id: "N", name: "No"},
        {id: "Y", name: "Yes"},
        {id: "Q", name: "Queued"},
        {id: "R", name: "Requested"},
        {id: "I", name: "Invalid"}
    ];

    hotkeys.bindTo($scope).add({
        combo: "ctrl+s",
        description: "Save the contact",
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function(event, hotkey) {
            event.preventDefault();
            $scope.save();
        }
    }).add({
        combo: "ctrl+r",
        description: "Reset the form",
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function(event, hotkey) {
            event.preventDefault();
            $scope.reset();
        }
    }).add({
        combo: "ctrl+y",
        description: "Lookup call on QRZ",
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function(event, hotkey) {
            event.preventDefault();
            $scope.qrz();
        }
    });
});
