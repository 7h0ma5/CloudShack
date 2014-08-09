var config;

function getAll(req, res) {
    res.send(config.getAll());
}

function setAll(req, res) {
    config.setAll(req.body);
    console.log(req.body);
    config.save();
    res.send("OK");
}

function getConfig(req, res) {
    var value = config.get(req.params.id);
    if (value !== undefined) {
        res.send(value);
    }
    else {
        res.status(404).send("Not Found");
    }
}

function setConfig(req, res) {
    config.set(req.params.id, req.body);
    config.save();
    res.send("OK");
}

exports.setup = function(cfg, app, io) {
    config = cfg;
    app.get("/config", getAll);
    app.post("/config", setAll);
    app.get("/config/:id", getConfig);
    app.post("/config/:id", setConfig);
}
