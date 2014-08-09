var Dxcc = require("../lib/dxcc").Dxcc;
var dxcc;

function lookup(req, res) {
    var result = dxcc.lookup(req.params.callsign);

    if (result) {
        res.send(result);
    }
    else {
        res.status(404).send({ error: "Not Found" });
    }
}

exports.setup = function(config, app, io) {
    dxcc = new Dxcc();
    app.get("/dxcc/:callsign", lookup);
}
