app.controller("NewContactCtrl", function($scope, $filter, $window, Toolkit,
                                          hotkeys, focus, Flash, Profile, Spots,
                                          Contact, Callbook, Dxcc, Data, Rig)
{
    $scope.rig = Rig;
    $scope.modes = Data.get("modes");
    $scope.contests = Data.get("contests");

    var preserve = ["freq", "mode", "submode", "tx_pwr"];

    function loadDefaults() {
        var profile = Profile.getActive();
        if (!profile) return;nnn

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
        $scope.startDate = Toolkit.nowUTC();
    };

    $scope.resetEnd = function() {
        $scope.endDate = Toolkit.nowUTC();
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
        $scope.contact["start"] = $scope.startDate.toJSON();
        $scope.contact["end"] = $scope.endDate.toJSON();

        Profile.apply($scope.contact);

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

    $scope.spot = function() {
        var spot = {
            call: $scope.contact.call,
            freq: $scope.contact.freq
        };
        Spots.submit(spot, function(res) {
            Flash.success($scope.contact.call + " spotted.");
        }, function (req) {
            Flash.error("Spot failed.");
        });
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
                    $scope.rst = mode.rst || "599";
                }
            });
        });
    });

    var mapTargets = [null, null, null];

    function updateMapTarget(coord) {
        var profile = Profile.getActive();
        var myPos = profile ? Toolkit.gridToCoord(profile.my_gridsquare) : null;

        $scope.maptarget = coord;

        if (coord && myPos) {
            $scope.distance = Toolkit.coordDistance(myPos, coord);
            $scope.bearing = Toolkit.coordBearing(myPos, coord);
        }
        else {
            $scope.distance = null;
            $scope.bearing = null;
        }
    }

    function setMapTarget(coord, priority) {
        mapTargets[priority] = coord;
        for (var i = 0; i < mapTargets.length; i++) {
            if (mapTargets[i]) {
                updateMapTarget(mapTargets[i]);
                return;
            }
        }
        updateMapTarget(null);
    }

    $scope.$watch("contact.gridsquare", function(newValue, oldValue) {
        if (newValue && (newValue.length == 4 || newValue.length == 6)) {
            console.log("set gridsquare");
            setMapTarget(Toolkit.gridToCoord(newValue), 0);
        }
        else {
            setMapTarget(null, 0);
        }
    });

    function resetDxcc() {
        delete $scope.dxcc;
        delete $scope.contact.cqz;
        delete $scope.contact.dxcc;
        delete $scope.contact.country;
        setMapTarget(null, 2);
    }

    function resetCallbook() {
        delete $scope.callbook;
        delete $scope.contact.ituz;
        setMapTarget(null, 1);
    }

    function resetPrevious() {
        $scope.previous = null;
    }

    $scope.$watch("contact.call", function(newValue, oldValue) {
        console.log("new Value", newValue);
        if (!newValue) {
            $scope.resetStart();
            $scope.resetEnd();
            resetDxcc();
            resetCallbook();
            resetPrevious();
            return;
        }

        Dxcc.get({"call": newValue}, function(result) {
            $scope.dxcc = result;
            $scope.contact.cqz = result.cqz;
            $scope.contact.dxcc = result.dxcc;
            $scope.contact.country = result.country;
            setMapTarget([result.lat, result.lon], 2);
        }, resetDxcc);

        if (newValue.length < 3) {
            resetCallbook();
            resetPrevious();
            return;
        }

        Callbook.get({"call": newValue}, function(result) {
            $scope.callbook = result;
            $scope.contact.ituz = result.ituz;
            setMapTarget(Toolkit.gridToCoord(result.gridsquare), 1);
        }, resetCallbook);

        var queryOptions = {
            view: "byCall",
            startkey: JSON.stringify([newValue]),
            endkey: JSON.stringify([newValue, {}]),
            descending: false
        };

        Contact.get(queryOptions, function(result) {
            $scope.previous = result.rows.length ? result.rows : null;
        }, resetPrevious);
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
