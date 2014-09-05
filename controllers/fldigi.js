var http = require("http"),
    libxml = require("libxmljs"),
    util = require("util"),
    adif = require("../lib/adif"),
    nano = require("nano");

var db;

function createResponse() {
    var doc = new libxml.Document();
    doc.node("methodResponse").node("params").node("param").node("value");
    return doc;
}

function addRecord(doc, res) {
    var value = doc.get("//value");
    if (!value) {
        res.status(400).send();
    }

    var data = value.text();
    var reader = new adif.AdiReader(data);
    var contacts = reader.readAll();

    db.bulk({docs: contacts}, function(err, data) {
        if (err) {
            res.status(500).send();
        }
        else {
            var resDoc = createResponse();
            res.send(resDoc.toString());
        }
    });
};

function getRecord(doc, res) {
    var value = doc.get("//value");
    if (!value) {
        res.status(404).send();
    }

    var resDoc = createResponse();
    var call = value.text();

    var query = {
        startkey: [call, {}], endkey: [call],
        descending: true, limit: 1
    };

    db.view("logbook", "byCall", query, function(err, data) {
        if (err || data.rows.length < 1) {
            res.send(resDoc.toString());
        }
        else {
            var writer = new adif.AdiWriter(data.rows);
            var data = writer.writeFldigiLine();
            console.log(data);

            resDoc.get("//value").text(data);
            res.send(resDoc.toString());
        }
    });
};

function checkDup(doc, res) {
    // TODO

    var resDoc = createResponse();
    resDoc.get("//value").text("false");

    res.send(resDoc.toString());
};

function listMethods(doc, res) {
    var resDoc = createResponse();
    resDoc.get("//value")
          .node("array").node("data")
          .node("value", "log.add_record").parent()
          .node("value", "log.check_dup").parent()
          .node("value", "log.get_record").parent()
          .node("value", "system.listMethods").parent()
          .node("value", "system.methodHelp");

    res.send(resDoc.toString());
};

function methodHelp(doc, res) {
    var resDoc = createResponse();
    res.send(resDoc.toString());
};

function rpc(req, res) {
    var doc;

    try {
        doc = libxml.parseXml(req.body)
    }
    catch (err) {
        res.status(400).send();
    }

    var methodName = doc.get("//methodName");
    if (!methodName) {
        res.status(400).send();
    }

    var method = methodName.text();
    res.header("transfer-encoding", "");
    res.contentType("text/xml");;

    if (method == "log.add_record") {
        addRecord(doc, res);
    }
    else if (method == "log.get_record") {
        getRecord(doc, res);
    }
    else if (method == "log.check_dup") {
        checkDup(doc, res);
    }
    else if (method == "system.listMethods") {
        listMethods(doc, res);
    }
    else if (method == "system.methodHelp") {
        methodHelp(doc, res);
    }
    else {
        res.status(404).send();
    }
}

exports.setup = function(config, app, io) {
    app.post("/RPC2", rpc);

    config.observe("db", function() {
        var local = config.get("db.local");
        db = nano(local).use("contacts");
    }, true);
}
