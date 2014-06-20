app.directive("navMenu", function($location) {
    function link($scope, element, attrs) {
        var links = element.find("a");
        var urlMap = {};
        var currentLink;

        for (var i = 0; i < links.length; i++) {
            var link = angular.element(links[i]);
            var url = link.attr("href");

            if (!url) continue;

            if ($location.$$html5) {
                urlMap[url] = link;
            }
            else {
                var pattern = /^\/?#[^\/]*/;
                urlMap[url.replace(pattern, "")] = link;
            }
        }

        $scope.$on("$routeChangeStart", function() {
            var pathLink = urlMap[$location.path()];

            if (pathLink) {
                if (currentLink) {
                    currentLink.removeClass("active");
                }
                currentLink = pathLink;
                currentLink.addClass("active");
            }
        });
    }

    return ({ link: link, scope: false });
});
