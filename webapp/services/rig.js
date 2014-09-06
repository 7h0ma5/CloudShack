app.factory("Rig", function($rootScope, Socket) {
    var rig = {
        connected: false,
        freq: 0.0,
        passband: 0,
        mode: ""
    };

    rig.setFrequency = function(freq) {
        Socket.emit("rig-set-freq", freq);
    }

    rig.setMode = function(mode, passband) {
        var args = {mode: mode, passband: passband};
        Socket.emit("rig-set-mode", args, function() {});
    }

    Socket.on("rig-update", function(rigState) {
        rig.freq = parseFloat(rigState.frequency/1e6).toFixed(4);
        rig.mode = rigState.mode;
        rig.passband = rigState.passband;
        rig.connected = rigState.connected;
    });

    return rig;
});
