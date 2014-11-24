var adif = require("adif"),
    lotw = require("../lib/lotw"),
    dxcc = require("../lib/dxcc"),
    data = require("../lib/data"),
    db = require("../lib/database"),
    async = require("async")
    url = require("url"),
    _ = require("lodash");

var lotw;

function allContacts(req, res) {
    if (!("descending" in req.query)) {
        req.query.descending = true;
    }

    var view = req.query.view || "byDate";

    db.contacts.view("logbook", view, req.query, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send(data);
    });
}

function readContact(req, res) {
    db.contacts.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send(data);
    });
}

function createContact(req, res) {
    var contact = req.body;
    updateBand(contact);

    db.contacts.insert(contact, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send(data);
    });
}

function updateContact(req, res) {

}

function deleteContact(req, res) {
    db.contacts.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send();
    });
}

function updateDxcc(contact) {
    var result = dxcc.lookup(contact.call);
    if (!result) return;

    contact.dxcc = result.dxcc;
    contact.cqz = result.cqz;
}

function applyProfile(profile, contact) {
    var fields = [
        "operator", "my_name", "my_gridsquare", "my_lat", "my_lon",
        "my_rig", "station_callsign"
    ];

    _.each(fields, function(field) {
        if (field in profile) {
            contact[field] = profile[field];
        }
    });
}

function exportContacts(req, res) {
    var writer;

    if (req.params.format == "adi") {
        writer = new adif.AdiWriter("CloudShack", "1.0");
    }
    else if (req.params.format == "adx") {
        writer = new adif.AdxWriter("CloudShack", "1.0");
    }
    else {
        return res.status(404).send();
    }

    db.contacts.view("logbook", "byDate", req.query, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else {
            _.each(data.rows, function(doc) {
                writer.writeContact(doc.value)
            });

            res.contentType("application/octet-stream");
            res.send(writer.getData());
        }
    });
}

function importContacts(req, res) {
    var contacts;

    if (req.params.format == "adi") {
        var reader = new adif.AdiReader(req.body);
        contacts = reader.readAll();
    }
    else if (req.params.format == "adx") {
        var reader = new adif.AdxReader(req.body);
        contacts = reader.readAll();
    }
    else {
        return res.status(404).send();
    }

    if (req.query.dxcc) {
        _.each(contacts, updateDxcc);
    }

    async.series([
        function(callback) {
            if (!req.query.profile) return callback();
            db.profiles.get(req.query.profile, function(err, data) {
                if (err) return callback(err);
                if (data.length < 1) return callback();
                _.each(contacts, _.partial(applyProfile, data));
                callback();
            });
        }
    ], function(err) {
        if (err) res.status(500).send();

        db.contacts.bulk({docs: contacts}, function(err, data) {
            if (err) res.status(err.status_code).send(err);
            else res.send({count: contacts.length});
        });
    })
}

function statistics(req, res) {
    if (!("group_level" in req.query)) {
        req.query.group_level = 3;
    }

    db.contacts.view("logbook", "stats", req.query, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send(data);
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

    db.contacts.view("logbook", "byDate", function(err, data) {
        if (err) callback(null);

        var result = _.find(data.rows, function(doc) {
            return doc.value.call == ref.call;
        });

        callback(result ? result.value : null);
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
            db.contacts.bulk({docs: updates}, function(err, data) {
                if (err) return res.status(500).send(err);

                res.send({count: data.length,
                          matches: matches,
                          fails: fails,
                          result: data});
            });
        });
    }, function(err) {
        res.status(500).send({error: err});
    });
}

exports.setup = function(config, app, io) {
    app.get("/contacts", allContacts);
    app.get("/contacts/_stats", statistics);
    app.get("/contacts/:id", readContact);
    app.get("/contacts.:format", exportContacts);
    app.post("/contacts.:format", importContacts);
    app.post("/contacts", createContact);
    app.put("/contacts/:id/:rev", updateContact);
    app.delete("/contacts/:id/:rev", deleteContact);
    app.post("/contacts/_lotw", importLotw);
}
