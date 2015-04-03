app.controller("LogbookCtrl", function($scope, Contact) {
    var filter = null;
    var limit = 20;
    var prev, start, next;

    function reset() {
        prev = [];
        start = null;
        next = null;
    }

    function responseReceived(result) {
        $scope.contacts = result["rows"].slice(0, limit);

        if (result["rows"].length == limit + 1) {
            next = result["rows"][limit];
        }
    }

    function responseError(result) {
        $scope.contacts = null;
    }

    $scope.reload = function() {
        var options = {
            descending: true,
            limit: limit+1
        }

        if (filter == "callsign") {
            options.startkey = JSON.stringify([$scope.callsign]);
            options.endkey = JSON.stringify([$scope.callsign, {}]);
            options.descending = false;
        }

        if (start) {
            options.startkey = start.key;
            options.startkey_docid = start.id;
        }

        var query = filter == "callsign" ? Contact.byCall : Contact.get;
        query(options, responseReceived, responseError);
    };

    $scope.hasNextPage = function() {
        return !!next;
    };

    $scope.hasPrevPage = function() {
        return !!start;
    };

    $scope.nextPage = function() {
        prev.push(start);
        start = next;
        next = null;
        $scope.reload();
    };

    $scope.prevPage = function() {
        next = start;
        start = prev.pop();
        $scope.reload();
    };

    $scope.filterCallsign = function() {
        filter = $scope.callsign ? "callsign" : null;
        reset();
        $scope.reload();
    };

    $scope.resetFilters = function() {
        delete $scope.callsign;
        filter = null;
        reset();
        $scope.reload();
    }

    reset();
    $scope.reload();
});
