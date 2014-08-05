var nano = require("nano");
var db;

function allProfiles(req, res) {
    var options = {
        include_docs: true
    };
    db.list(options, function(err, data) {
        if (err) res.status(500).send({error: err});
        else res.send(data);
    });
};

function readProfile(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(404).send({error: err});
        else res.send(data);
    });
};

function createProfile(req, res) {
    db.insert(req.body, function(err, data) {
        if (err) res.status(500).send({error: err});
        else res.send(data);
    });
};

function updateProfile(req, res) {
    var profile = req.body;
    profile["_id"] = req.params.id;
    profile["_rev"] = req.params.rev;
    db.insert(profile, function(err, data) {
        if (err) res.status(404).send({error: err});
        else res.send(data);
     });
};

function deleteProfile(req, res) {
    db.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(404).send({error: err});
        else res.send(data);
    });
};

exports.setup = function(config, app, io) {
    db = nano(config.db.local).use("profiles");

    app.get("/profiles", allProfiles);
    app.get("/profiles/:id", readProfile);
    app.post("/profiles", createProfile);
    app.put("/profiles/:id/:rev", updateProfile);
    app.delete("/profiles/:id/:rev", deleteProfile);
}
