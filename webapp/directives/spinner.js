app.directive("spinner", function() {
    var template = '<div class="spinner"></div>';

    return {
         restrict: 'E',
         template: template
    };
});
