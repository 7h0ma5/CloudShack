app.controller("TabsController", function($scope) {
    $scope.current = 0;
    $scope.show = function(index) {
        $scope.current = index;
    }
});

app.directive("tabs", function() {
    function compile(element) {
        element.addClass("tabs");
        var tabs = angular.element("<ul>");
        var index = 0;

        tabs.addClass("tab-list");

        angular.forEach(element.children(), function(child) {
            var child = angular.element(child);
            var link = angular.element("<a>");
            var tab = angular.element("<li>").append(link);

            tab.addClass("tab");
            tab.attr("ng-class", '{active: current == ' + index + '}');

            link.attr("ng-click", "show(" + index + ")");
            link.text(child.attr("title"));

            child.addClass("tab-content");
            child.attr("ng-show", "current == " + index);

            tabs.append(tab);
            index++;
        });

        element.prepend(tabs);
    }

    return {
         restrict: 'E',
         controller: 'TabsController',
         compile: compile
    };
});
