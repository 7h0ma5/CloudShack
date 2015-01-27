app.controller("HomeCtrl", function($scope, Contact) {
    $scope.qso_stats = {total: 0, year: 0, month: 0};

    var date = new Date();
    var year = date.getUTCFullYear().toString();
    var month = date.getUTCMonth() + 1;
    month = month < 10 ?  "0" + month.toString() : month.toString();

    // Query total QSOs
    Contact.stats({group_level: 0}, function(stats) {
        $scope.qso_stats.total = stats.rows ? stats.rows[0].value : 0;
    });

    // Query QSOs from this year
    var options = {
        group_level: 1,
        startkey: JSON.stringify([year]),
        endkey: JSON.stringify([year, {}])
    };

    Contact.stats(options, function(stats) {
        $scope.qso_stats.year = stats.rows ? stats.rows[0].value : 0;
    });

    // Query QSOs from this month
    var options = {
        group_level: 2,
        startkey: JSON.stringify([year, month]),
        endkey: JSON.stringify([year, month, {}])
    };

    Contact.stats(options, function(stats) {
        $scope.qso_stats.month = stats.rows ? stats.rows[0].value : 0;
    });
});
