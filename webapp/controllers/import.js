app.controller("ImportCtrl", function($scope, $upload) {
    $scope.file = null;
    $scope.progress = null;
    $scope.loading = false;

    $scope.onFileSelect = function($files) {
        if ($files.length > 0) {
            $scope.file = $files[0];
        }
    };

    $scope.import = function() {
        if (!$scope.file) return;

        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer($scope.file);
        fileReader.onload = function(e) {
            $scope.loading = true;
            $upload.http({
                url: '/contacts.adi',
                headers: {'Content-Type': "text/plain"},
                data: e.target.result
            }).then(function(data) {
                console.log(data);
                $scope.loading = false;
            }, function(data) {
                console.log(data);
                $scope.loading = false;
            }, function(evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                console.log($scope.progress);
            });
        };
    };
});
