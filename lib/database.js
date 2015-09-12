var nano = require("nano"),
    log = require("./log");

var Database = function() {};

Database.prototype.init = function(local, remote) {
    var couch = nano(local.address);

    couch.db.create("profiles");
    this.profiles = couch.db.use("profiles");

    couch.db.create(local.name, function() { this.createViews() }.bind(this));
    this.contacts = couch.db.use(local.name);

    var local_url = url.resolve(local.address, local.name);
    var remote_url = null;
    var options = {continuous: true, create_target: false, filter: "logbook/sync"};

    if (remote.usecsdb && remote.cs && remote.cs.user && remote.cs.password) {
        remote_url = url.format({
            auth: remote.cs.user + ":" + remote.cs.password,
            protocol: "https",
            hostname: "cloudshack.org", port: 6984,
            pathname: "user_" + remote.cs.user.toLowerCase()
        });
    }
    else if (remote.address && remote.name) {
        options.create_target = true;
        remote_url = url.resolve(remote.address, remote.name);
    }

    if (remote_url) {
        couch.db.replicate(local_url, remote_url, options);
        couch.db.replicate(remote_url, local_url, {filter: "logbook/sync"});
    }

    this.defaultProfile = null;
}

Database.prototype.createViews = function() {
    var doc = {
        version: 5,
        views: {
            byDate: {
                map: "function(doc) {\
                    emit(doc.start);\
                }"
            },
            byCall: {
                map: "function(doc) {\
                    emit([doc.call.toUpperCase(), doc.start]);\
                }"
            },
            byGrid: {
                map: "function(doc) {\
                    if (doc.gridsquare) {\
                        var grid = doc.gridsquare.toUpperCase();\
                        emit([grid.slice(0,2), grid.slice(2,4), grid.slice(4,6)]);\
                    }\
                }",
                reduce: "_count"
            },
            byMode: {
                map: "function(doc) {\
                    if (doc.mode) {\
                        if (doc.submode) emit([doc.mode, doc.submode]);\
                        else emit([doc.mode]);\
                    }\
                }",
                reduce: "_count"
            },
            dxcc: {
                map: "function(doc) {\
                    if (doc.dxcc) {\
                        var status = {\
                            worked: doc.call,\
                            lotw: doc.lotw_qsl_rcvd == 'Y' ? doc.call : null,\
                            card: doc.qsl_rcvd == 'Y' ? doc.call : null\
                        };\
                        emit([doc.dxcc, 'MIXED'], status);\
                        if (doc.band) emit([doc.dxcc, doc.band], status);\
                        if (doc.mode) {\
                            switch (doc.mode) {\
                                case 'CW':\
                                    emit([doc.dxcc, 'CW'], status); break;\
                                case 'SSB': case 'FM': case 'AM':\
                                    emit([doc.dxcc, 'PHONE'], status); break;\
                                default:\
                                    emit([doc.dxcc, 'DIGITAL'], status);\
                            }\
                        }\
                    }\
                }",
                reduce: "function (key, values, rereduce) {\
                    var status = {worked: null, lotw: null, card: null};\
                    values.forEach(function(value) {\
                        if (value.worked) status.worked = value.worked;\
                        if (value.lotw) status.lotw = value.lotw;\
                        if (value.card) status.card = value.card;\
                    });\
                    return status;\
                }"
            },
            stats: {
                map: 'function(doc) {\
                    var date = doc.start.split("T")[0];\
                    var date_components = date.split("-");\
                    emit(date_components);\
                }',
                reduce: "_count"
            }
        },
        filters: {
            sync: 'function (doc, req) { return doc._id.charAt(0) != "_"; }'
        },
        validate_doc_update: 'function(newDoc, oldDoc, userCtx, secObj) {\
            if (newDoc._deleted) return;\
            if (!newDoc.call) throw({forbidden: "call field required"});\
            if (!newDoc.start) throw({forbidden: "start field required"});\
        }'
    };

    this.contacts.get("_design/logbook", function(err, data) {
        if (err) {
            this.contacts.insert(doc, "_design/logbook");
            log.info("Creating design document (version %d)", doc.version);
        }
        else if (!data.version || data.version < doc.version) {
            doc._rev = data._rev;
            this.contacts.insert(doc, "_design/logbook");
            log.info("Updating design document (%d -> %d)",
                     data.version, doc.version);
        }
        else if (data.version > doc.version) {
            log.error("Design document is not compatible (%d > %d)",
                      data.version, doc.version);
        }
        else if (data.version == doc.version) {
            log.info("Design document up to date (version %d)", doc.version);
        }
        else {
            log.error("Failed to create the design document");
        }
    }.bind(this));
}

Database.prototype.findContact = function(ref, callback) {
    var interval = 5;
    var start = new Date(ref["start"]);
    var end = new Date(ref["end"] ? ref["end"] : ref["start"]);
    start.setMinutes(start.getHours() - interval);
    end.setMinutes(start.getHours() + interval);

    var params = {
        startkey: start.toJSON(), endkey: end.toJSON(), include_docs: true
    };

    this.contacts.view("logbook", "byDate", {include_docs: true}, function(err, data) {
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

Database.prototype.applyProfile = function(profile, contact) {
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

Database.prototype.setDefaultProfile = function(profile) {
    this.defaultProfile = profile;
}

Database.prototype.applyDefaultProfile = function(contacts, callback) {
    if (!this.defaultProfile) return callback();

    this.profiles.get(this.defaultProfile, function(err, data) {
        if (!err && data) {
            _.each(contacts, _.partial(this.applyProfile, data));
        }
        callback(err);
    }.bind(this));
}

module.exports = new Database();
