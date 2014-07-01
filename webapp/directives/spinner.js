app.directive("spinner", function() {
    var template = '\
    <span class="spinner">\
      <span class="rect1"></span>\
      <span class="rect2"></span>\
      <span class="rect3"></span>\
      <span class="rect4"></span>\
      <span class="rect5"></span>\
    </span>';

    return {
         restrict: 'E',
         template: template
    };
});
