app.directive("clock", function($interval, dateFilter, Toolkit) {
    function link($scope, element, attrs) {
        var update = function() {
            element.text(dateFilter(new Date(), "HH:mm:ss", "UTC"));
        };

        var timer = $interval(update, 1000);

        element.bind("$destroy", function() {
            $interval.cancel(timer);
        });

        update();
    }

    return ({ link: link, scope: false });
});
