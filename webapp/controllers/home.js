app.controller("HomeCtrl", function($scope, Contact) {
    $scope.qso_stats = {total: 0, year: 0, month: 0};

    var date = new Date();
    var year = date.getUTCFullYear().toString();
    var month = date.getUTCMonth() + 1;
    month = month < 10 ?  "0" + month.toString() : month.toString();

    // Query total QSOs
    Contact.stats({group_level: 0}, function(stats) {
        $scope.qso_stats.total = stats.rows.length ? stats.rows[0].value : 0;
    });

    // Query QSOs from this year
    var options = {
        group_level: 1,
        startkey: JSON.stringify([year]),
        endkey: JSON.stringify([year, {}])
    };

    Contact.stats(options, function(stats) {
        $scope.qso_stats.year = stats.rows.length ? stats.rows[0].value : 0;
    });

    // Query QSOs from this month
    var options = {
        group_level: 2,
        startkey: JSON.stringify([year, month]),
        endkey: JSON.stringify([year, month, {}])
    };

    Contact.stats(options, function(stats) {
        $scope.qso_stats.month = stats.rows.length ? stats.rows[0].value : 0;
    });

    // Query modes
    var options = {
        group_level: 1,
        include_docs: false,
        descending: false
    };

    Contact.byMode(options, function(modes) {
        var labels = [], data = [];

        angular.forEach(modes.rows, function(mode) {
            labels.push(mode.key[0]);
            data.push(mode.value);
        });

        $scope.modeLabels = labels;
        $scope.modeData = data;
    });
});
