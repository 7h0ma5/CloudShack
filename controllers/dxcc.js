var dxcc = require("../lib/dxcc");

function lookup(req, res) {
    var date = req.query.date ? new Date(req.query.date) : null;
    var result = dxcc.lookup(req.params.callsign, date);

    if (result) {
        res.send(result);
    }
    else {
        res.status(404).send({ error: "Not Found" });
    }
}

exports.setup = function(config, app, io) {
    app.get("/dxcc/:callsign", lookup);
}
