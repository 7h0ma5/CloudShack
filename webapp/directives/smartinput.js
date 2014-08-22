app.directive("smartinput", function($location) {
    function link(scope, element, attrs, ngModel) {
        element.bind("blur", function() {
            if (element.val().length == 0) {
                var value = element.attr("placeholder");
                ngModel.$setViewValue(value);
                ngModel.$render();
            }
        });
    }

    return ({restrict: "A", require: 'ngModel', link: link, scope: false});
});
