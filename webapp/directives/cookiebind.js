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
            if (ngModel.$viewValue.length > 0) {
                $cookies[scope.cookie] = ngModel.$viewValue;
            }
        });
    }

    return ({restrict: "A", link: link, require: 'ngModel',
             scope: {cookie: "@cookieBind", ngModel: "="}});
});
