app.directive("uppercase", function() {
    function link(scope, element, attrs, ngModel) {
        var makeUppercase = function(input) {
            var uppercase = input.toUpperCase();
            if (uppercase !== input) {
                ngModel.$setViewValue(uppercase);
                ngModel.$render();
            }
            return uppercase;
        };

        ngModel.$parsers.push(makeUppercase);
    }

    return ({ restrict: "A", require: 'ngModel', link: link, scope: {ngModel: '='} });
});
