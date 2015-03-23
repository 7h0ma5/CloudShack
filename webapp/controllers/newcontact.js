app.controller("NewContactCtrl", function($scope, $filter, $window, $q, Toolkit,
                                          hotkeys, focus, Flash, Profile, Spots,
                                          Contact, Callbook, Dxcc, Data, Rig, CW)
{
    $scope.rig = Rig;
    $scope.cw = CW;
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
        $scope.startDate = new Date();
        $scope.startDate.setUTCMilliseconds(0);
    };

    $scope.resetEnd = function() {
        $scope.endDate = new Date();
        $scope.endDate.setUTCMilliseconds(0);
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

    function freqChanged(newValue, oldValue) {
        if (!newValue || newValue == oldValue) return;
        if (!$scope.rig || !$scope.rig.connected) return;
        $scope.rig.setFrequency(newValue);
    }

    function rigFreqChanged(newValue, oldValue) {
        if (!newValue || newValue == oldValue) return;
        if (!$scope.rig || !$scope.rig.connected) return;
        $scope.contact.freq = newValue;
    }

    function modeChanged(newValue, oldValue) {
        if (newValue != oldValue && "submode" in $scope.contact) {
            delete $scope.contact.submode;
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
    }

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

    function gridChanged(newValue, oldValue) {
        if (newValue && (newValue.length == 4 || newValue.length == 6)) {
            setMapTarget(Toolkit.gridToCoord(newValue), 0);
        }
        else {
            setMapTarget(null, 0);
        }
    }

    function resetDxcc() {
        if ("dxcc" in $scope) delete $scope.dxcc;
        if ("cqz" in $scope.contact) delete $scope.contact.cqz;
        if ("dxcc" in $scope.contact) delete $scope.contact.dxcc;
        if ("country" in $scope.contact) delete $scope.contact.country;
        setMapTarget(null, 2);
    }

    function resetCallbook() {
        if ("callbook" in $scope) delete $scope.callbook;
        if ("ituz" in $scope.contact) delete $scope.contact.ituz;
        setMapTarget(null, 1);
    }

    function resetPrevious() {
        $scope.previous = null;
    }

    function callChanged(newValue, oldValue) {
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
            if (result.lat && result.lon) {
                setMapTarget([result.lat, result.lon], 2);
            }
        }, resetDxcc);

        if (newValue.length < 3) {
            resetCallbook();
            resetPrevious();
            return;
        }

        Callbook.get({"call": newValue}, function(result) {
            // ignore this result if the call has already been changed
            if (result.call != $scope.contact.call) return;

            $scope.callbook = result;
            $scope.contact.ituz = result.ituz;

            var coord = Toolkit.gridToCoord(result.gridsquare);
            if (coord) setMapTarget(coord, 1);
        }, resetCallbook);

        var queryOptions = {
            startkey: JSON.stringify([newValue]),
            endkey: JSON.stringify([newValue, {}]),
            descending: false
        };

        Contact.byCall(queryOptions, function(result) {
            $scope.previous = result.rows.length ? result.rows : null;
        }, resetPrevious);
    }

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

    $scope.sendCW = function() {
        CW.sendText($scope.cwtext);
        $scope.cwtext = "";
    };

    $q.all([
        $scope.modes.$promise,
        $scope.contests.$promise
    ]).then(function() {
        $scope.$watch("contact.call", callChanged);
        $scope.$watch("contact.gridsquare", gridChanged);
        $scope.$watch("contact.mode", modeChanged);
        $scope.$watch("contact.freq", freqChanged);
        $scope.$watch("rig.freq", rigFreqChanged);
        $scope.reset();
    });
});
