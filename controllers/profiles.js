var db = require("../lib/database");

function allProfiles(req, res) {
    var options = {
        include_docs: true
    };
    db.profiles.list(options, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function readProfile(req, res) {
    db.profiles.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function saveProfile(req, res) {
    db.profiles.insert(req.body, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function deleteProfile(req, res) {
    db.profiles.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

exports.setup = function(config, app, io) {
    app.get("/profiles", allProfiles);
    app.get("/profiles/:id", readProfile);
    app.post("/profiles", saveProfile);
    app.delete("/profiles/:id/:rev", deleteProfile);
}
