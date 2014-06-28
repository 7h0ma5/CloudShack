var adi = require("../lib/adi"),
    PouchDB = require("pouchdb");

var db;

function createViews(db) {
    db.put({_id: "_design/logbook",
        views: {
            "logbook": {
                map: function(doc) {
                    if (doc.start) {
                        emit(doc.start, doc);
                    }
                }.toString()
            }
        }
    }).catch(function(err) {});
}

function allContacts(req, res) {
    var options = {
        descending: true
    };

    if ("limit" in req.query) {
        options["limit"] = parseInt(req.query["limit"]);
    }

    db.query("logbook", options, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data);
    });
};

function readContact(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(data);
    });
};

function createContact(req, res) {
    db.post(req.body, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data);
    });
};

function updateContact(req, res) {
};

function deleteContact(req, res) {
    var params = {"_id": req.params.id, "_rev": req.params.rev};
    db.remove(params, {}, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(200);
    });
};

function exportAdif(req, res) {
    var map = function(doc) {
        if (doc.start) {
            emit(doc.start, doc);
        }
    }

    db.query(map, null, function(err, data) {
        if (err) {
            res.send(500, {error: err});
        }
        else {
            var writer = new adi.AdiWriter(data["rows"]);
            res.contentType("application/octet-stream");
            res.send(writer.writeAll());
        }
    });
};

function importAdif(req, res) {
    var reader = new adi.AdiReader(req.rawBody);
    var contacts = reader.readAll();

    db.bulkDocs({docs: contacts}, function(err, data) {
        if (err) {
            res.send(500, {error: err});
        }
        else {
            res.send({count: contacts.length});
        }
    });
};

function statistics(req, res) {
    var map = function(doc) {
        if (doc.start) {
            emit(doc.start.split("T")[0], doc);
        }
    }

    db.query({map: map, reduce: "_count"}, function(err, data) {
        if (err) {
            res.send(500, {error: err});
        }
        else {
            res.send(data["rows"]);
        }
    });
};

exports.setup = function(config, app, io) {
    var local = config.db.local;
    var server = config.db.remote;

    db = new PouchDB(local);

    //db.replicate.to(server, {live: true});
    //db.replicate.from(server, {live: true});

    createViews(db);

    app.get("/contacts", allContacts);
    app.get("/contacts/stats", statistics);
    app.get("/contacts/:id", readContact);
    app.post("/contacts", createContact);
    app.put("/contacts/:id/:rev", updateContact);
    app.delete("/contacts/:id/:rev", deleteContact);
    app.get("/contacts.adi", exportAdif);
    app.post("/contacts.adi", importAdif);
}
