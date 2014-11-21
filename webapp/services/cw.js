app.factory("CW", function($rootScope, Socket) {
    var cw = {};

    cw.sendText = function(text) {
        Socket.emit("cw-send", text);
    };

    Socket.on("cw-status", function(state) {
        cw.status = state;
    });

    return cw;
});
