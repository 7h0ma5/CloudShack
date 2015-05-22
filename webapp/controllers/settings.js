app.controller("SettingsCtrl", function($scope, Config, Profile, Flash) {
    $scope.config = Config.get();
    $scope.profiles = Profile.get();

    $scope.save = function() {
        Config.save($scope.config, function(res) {
            Flash.success("Settings saved.");
        }, function(res) {
            Flash.error("Failed to save settings.")
        });
    }
});
