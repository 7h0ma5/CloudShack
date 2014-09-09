app.controller("LogbookCtrl", function($scope, Contact) {
    var limit = 20;
    var prev = [];
    var start = null;
    var next = null;

    $scope.total_pages = 1;
    $scope.page = 1;

    $scope.reload = function() {
        var options = {
            descending: true,
            limit: limit+1
        }

        if (start) {
            options.startkey = start.key;
            options.startkey_docid = start.id;
        }

        Contact.get(options,
            function(result) {
                $scope.contacts = result["rows"].slice(0, limit);
                $scope.total_pages = Math.ceil(result["total_rows"]/limit);

                if (result["rows"].length == limit + 1) {
                    next = result["rows"][limit];
                }
            },
            function(error) {
                alert("Error " + error);
            }
        );
    };

    $scope.hasNextPage = function() {
        return !!next;
    };

    $scope.hasPrevPage = function() {
        return !!start;
    };

    $scope.nextPage = function() {
        prev.push(start);
        start = next;
        next = null;
        $scope.page++;
        $scope.reload();
    };

    $scope.prevPage = function() {
        next = start;
        start = prev.pop();
        $scope.page--;
        $scope.reload();
    };

    $scope.reload();
});
