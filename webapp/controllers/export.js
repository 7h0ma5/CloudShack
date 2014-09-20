app.controller("ExportCtrl", function($scope, $window) {
    var date = $scope.dateToIso($scope.dateToUTC(new Date()));
    $scope.start = $scope.end = date;

    $scope.format = "adi";

    $scope.formats = [
        {id: "adi", name: "ADIF (.adi)"},
        {id: "adx", name: "ADIF (.adx)"}
    ];

    $scope.export = function() {
        var query = "";

        if ($scope.dateRange) {
            var start = new Date(Date.parse($scope.start));
            var end = new Date(Date.parse($scope.end));
            var startkey = encodeURIComponent(JSON.stringify(start.toJSON()));
            var endkey = encodeURIComponent(JSON.stringify(end.toJSON()));

            query = "?startkey=" + startkey + "&endkey=" + endkey;
        }

        $window.open("/contacts." + $scope.format + query);
    };
});
