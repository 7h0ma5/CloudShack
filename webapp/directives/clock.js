app.directive("clock", function($interval, dateFilter, Toolkit) {
    function link($scope, element, attrs) {
        var format = 'HH:mm:ss';

        var update = function() {
            element.text(dateFilter(Toolkit.dateToUTC(new Date()), format));
        };

        var timer = $interval(update, 1000);

        element.bind("$destroy", function() {
            $interval.cancel(timer);
        });

        update();
    }

    return ({ link: link, scope: false });
});
