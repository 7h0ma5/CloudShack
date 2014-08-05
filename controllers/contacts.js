var adi = require("../lib/adi");
var nano = require("nano");
var db;

function createViews(db) {
    db.insert({
        views: {
            byDate: {
                map: function(doc) {
                    if (doc.start) {
                        emit(doc.start, doc);
                    }
                }.toString()
            },
            byCall: {
                map: function(doc) {
                    if (doc.start) {
                        emit([doc.call, doc.start], doc);
                    }
                }
            }
        }
    }, "_design/logbook");
}

function allContacts(req, res) {
    if (!("descending" in req.query)) {
        req.query.descending = true;
    }

    db.view("logbook", "byDate", req.query, function(err, data) {
        if (err) res.status(500).send({error: err});
        else res.send(data);
    });
};

function readContact(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(404).send({error: err});
        else res.send(data);
    });
};

function createContact(req, res) {
    db.insert(req.body, function(err, data) {
        if (err) res.status(500).send({error: err});
        else res.send(data);
    });
};

function updateContact(req, res) {
};

function deleteContact(req, res) {
    db.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(404).send({error: err});
        else res.status(200).send();
    });
};

function exportAdif(req, res) {
    db.view("logbook", "byDate", req.query, function(err, data) {
        if (err) {
            res.status(500).send({error: err});
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
            res.status(500).send({error: err});
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
            res.status(500).send({error: err});
        }
        else {
            res.send(data["rows"]);
        }
    });
};

exports.setup = function(config, app, io) {
    db = nano(config.db.local).use("contacts");
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
