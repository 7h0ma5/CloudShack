app.controller("SettingsCtrl", function($scope, Config, Flash) {
    $scope.config = Config.get();

    $scope.save = function() {
        Config.save($scope.config, function(res) {
            Flash.success("Settings saved.");
        }, function(res) {
            Flash.error("Failed to save settings.")
        });
    }
});
