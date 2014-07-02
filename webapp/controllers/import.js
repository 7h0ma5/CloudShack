app.controller("ImportCtrl", function($scope, $upload, Flash) {
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
            }).then(function(res) {
                Flash.success(res.data.count + " contacts imported.")
                $scope.loading = false;
            }, function(res) {
                Flash.error("Import failed.")
                $scope.loading = false;
            });
        };
    };
});
