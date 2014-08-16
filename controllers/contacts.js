var adi = require("../lib/adi"),
    lotwlib = require("../lib/lotw"),
    nano = require("nano"),
    async = require("async");

var db;
var lotw;

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
}

function readContact(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(404).send({error: err});
        else res.send(data);
    });
}

function createContact(req, res) {
    db.insert(req.body, function(err, data) {
        if (err) res.status(500).send({error: err});
        else res.send(data);
    });
}

function updateContact(req, res) {
}

function deleteContact(req, res) {
    db.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(404).send({error: err});
        else res.status(200).send();
    });
}

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
}

function importAdif(req, res) {
    var reader = new adi.AdiReader(req.rawBody);
    var contacts = reader.readAll();

    db.bulk({docs: contacts}, function(err, data) {
        if (err) {
            res.status(500).send({error: err});
        }
        else {
            res.send({count: contacts.length});
        }
    });
}

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
}

function searchContact(ref, callback) {
    var start = new Date(ref["start"]);
    start.setMinutes(start.getHours() - 15);

    var end = new Date(ref["end"] ? ref["end"] : ref["start"]);
    end.setMinutes(start.getHours() + 15);

    var params = {
        startkey: start.toJSON(), endkey: end.toJSON(), include_docs: true
    };

    db.view("logbook", "byDate", function(err, data) {
        if (err) callback(null);

        for (var i = 0; i < data.rows.length; i++) {
            var contact = data.rows[i];
            if (contact.value.call == ref.call) {
                callback(contact.value);
                return;
            }
        }

        callback(null);
    });
}

function importLotw(req, res) {
    lotw.getQSL(function(data) {
        var updates = [];
        var matches = [];
        var fails = [];

        async.each(data, function(entry, callback) {
            searchContact(entry, function(contact) {
                if (contact) {
                    if (entry.qsl_rcvd == "Y" && contact.lotw_qsl_rcvd != "Y") {
                        contact.lotw_qsl_rcvd = "Y";
                        updates.push(contact);
                    }
                    matches.push(contact.call);
                }
                else {
                    fails.push(entry.call);
                }
                callback(null);
            });
        }, function(err) {
            db.bulk({docs: updates}, function(err, data) {
                if (err) {
                    res.status(500).send({error: err});
                }
                else {
                    res.send({count: data.length, matches: matches, fails: fails});
                }
            });
        });
    }, function(err) {
        res.status(500).send({error: err});
    });
}

exports.setup = function(config, app, io) {
    config.observe("db", function() {
        var couch = nano(config.get("db.local"));
        couch.db.create("contacts");
        db = couch.db.use("contacts");
        createViews(db);

        lotw = new lotwlib.LOTW(config.get("lotw.username"), config.get("lotw.password"));
    });

    app.get("/contacts", allContacts);
    app.get("/contacts/stats", statistics);
    app.get("/contacts/:id", readContact);
    app.post("/contacts", createContact);
    app.put("/contacts/:id/:rev", updateContact);
    app.delete("/contacts/:id/:rev", deleteContact);
    app.get("/contacts.adi", exportAdif);
    app.post("/contacts.adi", importAdif);
    app.post("/lotw/import", importLotw);
}
