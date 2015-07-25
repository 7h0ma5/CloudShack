app.controller("ImportCtrl", function($scope, Upload, Flash, Contact, Profile) {
    $scope.file = null;
    $scope.progress = null;
    $scope.loading = false;
    $scope.profiles = Profile.get();

    $scope.start = new Date();
    $scope.start.setUTCMilliseconds(0);
    $scope.end = new Date();
    $scope.end.setUTCMilliseconds(0);

    $scope.fileSelected = function($files, $event) {
        if ($files.length > 0) {
            $scope.file = $files[0];
        }
    };

    $scope.import = function() {
        if (!$scope.file) return;

        var params = {};

        if ($scope.dxcc) {
            params["dxcc"] = true;
        }
        if ($scope.dateRange) {
            params["start"] = $scope.start.toJSON();
            params["end"] = $scope.end.toJSON();
        }

        if ($scope.profile) {
            params["profile"] = $scope.profile;
        }

        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer($scope.file);
        fileReader.onload = function(e) {
            $scope.loading = true;
            Upload.http({
                url: '/contacts.adi',
                headers: {'Content-Type': "text/plain"},
                data: e.target.result,
                params: params
            }).then(function(res) {
                Flash.success(res.data.count + " contacts imported.")
                $scope.loading = false;
            }, function(res) {
                Flash.error("Import failed.")
                $scope.loading = false;
            });
        };
    };

    $scope.importLotw = function() {
        $scope.loading = true;
        Contact.lotw({}, function(res) {
            Flash.success("LotW import sucessful.");
            $scope.loading = false;
            $scope.lotwResult = res;
        }, function(err) {
            Flash.error("LotW import failed.");
            $scope.loading = false;
        })
    };
});
