app.directive("cookieBind", function($cookies) {
    function link(scope, element, attrs, ngModel) {
        var initial = $cookies[scope.cookie];
        if (initial && initial.length > 0) {
            if (attrs.type == "number") {
                initial = parseFloat(initial);
            }

            ngModel.$setViewValue(initial);
            ngModel.$render();
        }

        element.bind("blur", function() {
            if (element.val().length > 0) {
                $cookies[scope.cookie] = element.val();
            }
        });
    }

    return ({restrict: "A", link: link, require: 'ngModel',
             scope: {cookie: "@cookieBind", ngModel: "="}});
});
