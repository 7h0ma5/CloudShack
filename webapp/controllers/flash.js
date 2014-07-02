app.factory("Flash", function($rootScope) {
    var flash = function(level, text) {
        var message = { level: level, text: text };
        $rootScope.$emit("flash", message)
    }

    angular.forEach(['error', 'warning', 'info', 'success'], function (level) {
        flash[level] = function (text) { flash(level, text); };
    });

    return flash;
});

app.controller('FlashCtrl', function($scope, $rootScope, $timeout) {
    $scope.message = null;
    $scope.show = false;
    var timeout;

    $rootScope.$on("flash", function(_, message) {
        $timeout.cancel(timeout);
        $scope.message = message;
        $scope.show = true;

        timeout = $timeout(function() {
            $scope.show = false;
        }, 5000);
    });
});
