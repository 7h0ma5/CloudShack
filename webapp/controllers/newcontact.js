app.controller("NewContactCtrl", function($scope, $filter, $window,
                                          hotkeys, focus, Flash, Profile,
                                          Contact, Callbook, Dxcc, Data, Rig)
{
    $scope.rig = Rig;
    $scope.modes = Data.get("modes");
    $scope.contests = Data.get("contests");

    var preserve = ["freq", "mode", "submode", "tx_pwr"];

    function loadDefaults() {
        var profile = Profile.getActive();
        if (!profile) return;

        angular.forEach(preserve, function(key) {
            if (key in profile) {
                $scope.contact[key] = profile[key];
            }
        });
    }

    function saveDefaults() {
        var profile = Profile.getActive();
        if (!profile) return;

        var defaults = {};

        angular.forEach(preserve, function(key) {
            if (key in $scope.contact) {
                defaults[key] = $scope.contact[key];
            }
        });

        Profile.setDefaults(defaults);
    }

    $scope.resetStart = function() {
        var utc = $scope.dateToUTC(new Date());
        $scope.startDate = $scope.dateToIso(utc);
    };

    $scope.resetEnd = function() {
        var utc = $scope.dateToUTC(new Date());
        $scope.endDate = $scope.dateToIso(utc);
    };

    $scope.reset = function() {
        $scope.resetStart();
        $scope.resetEnd();

        if ($scope.contact) {
            var newContact = {};
            angular.forEach(preserve, function(key) {
                if (key in $scope.contact) {
                    newContact[key] = $scope.contact[key];
                }
            });
            $scope.contact = newContact;
        }
        else {
            $scope.contact = {};
            loadDefaults();
        }

        $scope.callbook = null;
        $scope.previous = null;
        $scope.dxcc = null;

        focus("call");
    };

    $scope.save = function() {
        var start = new Date(Date.parse($scope.startDate));
        var end = new Date(Date.parse($scope.endDate));
        $scope.contact["start"] = start.toJSON();
        $scope.contact["end"] = end.toJSON();

        // remove empty fields
        for (var key in $scope.contact) {
            if (!$scope.contact[key]) {
                delete $scope.contact[key];
            }
        }

        Contact.save($scope.contact, function(res) {
            Flash.success("Contact with " + $scope.contact.call + " saved.");
            saveDefaults();
            $scope.reset();
        }, function(res) {
            Flash.error("Failed to save contact.")
        });
    };

    $scope.qrz = function() {
        $window.open("http://www.qrz.com/db/" + $scope.contact.call);
    };

    $scope.$watch("contact.mode", function(newValue, oldValue) {
        if (newValue != oldValue) {
            delete $scope.contact["submode"];
        }
        $scope.submodes = null;

        $scope.modes.$promise.then(function(modes) {
            angular.forEach(modes, function(mode) {
                if (mode.name == newValue) {
                    $scope.submodes = mode.submodes;
                }
            });
        });
    });

    $scope.$watch("contact.call", function(newValue, oldValue) {
        if (!newValue) {
            $scope.resetStart();
            $scope.resetEnd();
            return;
        }

        Dxcc.get({"call": newValue}, function(result) {
            $scope.dxcc = result;
        });

        if (newValue.length < 3) return;

        Callbook.get({"call": newValue}, function(result) {
            $scope.callbook = result;
        }, function(err) {
            $scope.callbook = null;
        });

        var queryOptions = {
            view: "byCall",
            startkey: JSON.stringify([newValue]),
            endkey: JSON.stringify([newValue, {}]),
            descending: false
        };

        Contact.get(queryOptions,
           function(result) {
            $scope.previous = result.rows;
        }, function(err) {
            $scope.previous = null;
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

    $scope.reset();
});
