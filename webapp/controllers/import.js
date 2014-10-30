app.controller("ImportCtrl", function($scope, $upload, Flash, Toolkit, Contact, Profile) {
    $scope.file = null;
    $scope.progress = null;
    $scope.loading = false;
    $scope.profiles = Profile.get();

    var date = Toolkit.nowToIso();
    $scope.start = $scope.end = date;

    $scope.onFileSelect = function($files) {
        if ($files.length > 0) {
            $scope.file = $files[0];
        }
    };

    $scope.import = function() {
        if (!$scope.file) return;

        var params = {};

        if ($scope.dateRange) {
            var start = new Date(Date.parse($scope.start));
            var end = new Date(Date.parse($scope.end));
            params["start"] = start.toJSON();
            params["end"] = end.toJSON();
        }

        if ($scope.profile) {
            params["profile"] = $scope.profile;
        }

        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer($scope.file);
        fileReader.onload = function(e) {
            $scope.loading = true;
            $upload.http({
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
