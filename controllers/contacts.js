var adif = require("adif"),
    lotw = require("../lib/lotw"),
    dxcc = require("../lib/dxcc"),
    data = require("../lib/data"),
    db = require("../lib/database"),
    async = require("async")
    url = require("url"),
    fs = require("fs"),
    _ = require("lodash");

var lotw;

function allContacts(req, res) {
    var view = req.params.view || "byDate";
    var options = {
        descending: true,
        include_docs: true,
        limit: 50
    };

    _.merge(options, req.query);

    db.contacts.view("logbook", view, options, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function readContact(req, res) {
    db.contacts.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function createContact(req, res) {
    var contact = req.body;
    updateBand(contact);

    fs.appendFile("contacts.log", JSON.stringify(contact) + "\n");

    db.contacts.insert(contact, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function updateContact(req, res) {

}

function deleteContact(req, res) {
    db.contacts.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
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

function updateBand(contact) {
    if (contact.band || !contact.freq) return;

    _.each(data.bands, function(band) {
        if (contact.freq >= band.start && contact.freq <= band.end) {
            contact.band = band.name.toUpperCase();
            return false;
        }
    });
}

function migrateMode(contact) {
    if (contact.submode || !contact.mode) return;

    var result = data.legacyModes[contact.mode];

    if (result) {
        _.merge(contact, result);
    }
}

function exportContacts(req, res) {
    var writer;
    var options = { "include_docs": true };
    _.merge(options, req.query);

    switch (req.params.format) {
        case "adi":
            writer = new adif.AdiWriter("CloudShack", "1.0");
            break;
        case "adx":
            writer = new adif.AdxWriter("CloudShack", "1.0");
            break;
        default:
            return res.status(404).send();
    }

    db.contacts.view("logbook", "byDate", options, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else {
            _.each(data.rows, function(row) {
                writer.writeContact(row.doc)
            });

            res.contentType("application/octet-stream");
            res.send(writer.getData());
        }
    });
}

function importContacts(req, res) {
    var contacts;

    switch (req.params.format) {
        case "adi":
            var reader = new adif.AdiReader(req.body);
            contacts = reader.readAll();
            break;
        case "adx":
            var reader = new adif.AdxReader(req.body);
            contacts = reader.readAll();
            break;
        default:
            return res.status(404).send();
    }

    var start = req.query.start ? new Date(req.query.start) : null;
    var end = req.query.end ? new Date(req.query.end) : null;

    contacts = _.filter(contacts, function(contact) {
        return (new Date(contact.start)) > start
            && (new Date(contact.start)) < end;
    });

    if (req.query.dxcc) _.each(contacts, updateDxcc);

    _.each(contacts, updateBand);
    _.each(contacts, migrateMode);

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
            if (err) res.status(err.statusCode).send(err);
            else res.send({count: contacts.length});
        });
    })
}

function statistics(req, res) {
    var options = { group_level: 3 };
    _.merge(options, req.query);

    db.contacts.view("logbook", "stats", options, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function searchContact(ref, callback) {
    var interval = 5;
    var start = new Date(ref["start"]);
    var end = new Date(ref["end"] ? ref["end"] : ref["start"]);
    start.setMinutes(start.getHours() - interval);
    end.setMinutes(start.getHours() + interval);

    var params = {
        startkey: start.toJSON(), endkey: end.toJSON(), include_docs: true
    };

    db.contacts.view("logbook", "byDate", {include_docs: true}, function(err, data) {
        if (err) callback(null);

        var result = _.find(data.rows, function(row) {
            // we can stop instantly if the bands are not the same
            if (row.doc.band && ref.band && row.doc.band.toUpperCase() != ref.band.toUpperCase()) {
                return false;
            }

            return row.doc.call.toUpperCase() == ref.call.toUpperCase();
        });

        callback(result ? result.doc : null);
    });
}

function importLotw(req, res) {
    lotw.query({qso_query: 1, qso_qsl: "no", qso_qsldetail: "yes"}, function(data) {
        var updates = [], fails = [];

        async.eachLimit(data, 10, function(entry, callback) {
            searchContact(entry, function(contact) {
                if (!contact) {
                    fails.push(entry.call);
                }
                else if (lotw.updateContact(contact, entry)) {
                    updates.push(contact);
                }
                callback(null);
            });
        }, function(err) {
            if (!updates) return;
            db.contacts.bulk({docs: updates}, function(err, data) {
                if (err) return res.status(500).send(err);
                res.send({updates: updates.length, fails: fails, result: data});
            });
        });
    }, function(err) {
        res.status(500).send({error: err});
    });
}

exports.setup = function(config, app, io) {
    app.get("/contacts", allContacts);
    app.get("/contacts/_stats", statistics);
    app.get("/contacts/_:view", allContacts);
    app.get("/contacts/:id", readContact);
    app.get("/contacts.:format", exportContacts);
    app.post("/contacts.:format", importContacts);
    app.post("/contacts", createContact);
    app.put("/contacts/:id/:rev", updateContact);
    app.delete("/contacts/:id/:rev", deleteContact);
    app.post("/contacts/_lotw", importLotw);
}
