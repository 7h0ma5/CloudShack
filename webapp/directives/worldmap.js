app.directive("worldmap", function($window, $timeout) {
    return {
        restrict: "E",
        scope: {
            maptarget: '='
        },
        link: function(scope, ele, attrs) {
            var offline = L.tileLayer("/map/{z}/{x}/{y}.png", {
                maxZoom: 4
            });

            L.Icon.Default.imagePath = '/images';

            var map = L.map(ele[0], {
                center: [51.505, -0.09],
                zoom: 2,
                layers: offline
            });

            var marker = L.marker([51.5, -0.09]).addTo(map);

            scope.$watch("maptarget", function(newValue, oldValue) {
                if (!newValue || newValue == oldValue) return;
                var pos = L.latLng(newValue.lat, newValue.lon);
                marker.setLatLng(pos);
                map.panTo(pos);
            });
      }}
});
