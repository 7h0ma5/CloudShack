app.controller("ExportCtrl", function($scope, $window) {
    $scope.start = new Date();
    $scope.end = new Date();

    $scope.format = "adi";

    $scope.formats = [
        {id: "adi", name: "ADIF (.adi)"},
        {id: "adx", name: "ADIF (.adx)"}
    ];

    $scope.export = function() {
        var query = "";

        if ($scope.dateRange) {
            var start = $scope.start.toJSON();
            var end = $scope.end.toJSON();
            var startkey = encodeURIComponent(JSON.stringify(start));
            var endkey = encodeURIComponent(JSON.stringify(end));

            query = "?startkey=" + startkey + "&endkey=" + endkey;
        }

        $window.open("/contacts." + $scope.format + query);
    };
});
