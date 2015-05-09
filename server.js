#!/usr/bin/env node

var express = require("express"),
    serveStatic = require("serve-static"),
    sockio = require("socket.io"),
    Config = require("./lib/config"),
    lotw = require("./lib/lotw"),
    db = require("./lib/database"),
    log = require("./lib/log");

function jsonParamParser(req, res, next) {
    for (prop in req.query) {
        try {
            req.query[prop] = JSON.parse(req.query[prop]);
        }
        catch (e) {}
    }
    next();
}

var Server = function(config, port) {
    this.config = config;
    this.port = port || 3000;

    var bodyParser = require("body-parser");

    this.app = express();
    this.app.use(require("errorhandler")());
    this.app.use(serveStatic(__dirname + "/public",  { maxAge: "1d" }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.text({type: "text/plain", limit: 10*1024*1024}));
    this.app.use(bodyParser.text({type: "text/xml", limit: 1*1024*1024}))
    this.app.use(jsonParamParser);

    this.io = new sockio();

    var self = this;
    ["contacts", "profiles", "callbook", "dxcc", "data",
     "rig", "keyer", "cluster", "fldigi", "wsjtx", "config"]
        .map(function(controllerName) {
            var controller = require("./controllers/" + controllerName);
            controller.setup(self.config, self.app, self.io);
        }
    );

    this.app.get("/shutdown", function(req, res) {
        setTimeout(function() { self.shutdown() }, 1000);
        res.status(200).send({status: "OK"});
    });

    config.observe("lotw", function() {
        var username = config.get("lotw.username");
        var password = config.get("lotw.password");
        lotw.setCredentials(username, password);
    }, true);

    config.observe("db", function() {
        var local = config.get("db.local");
        var remote = config.get("db.remote");
        db.init(local, remote);
    }, true);
}

Server.prototype.run = function() {
    log.info("Listening on port %d", this.port);
    this.server = this.app.listen(this.port);
    this.io.attach(this.server);
}

Server.prototype.shutdown = function() {
    this.server.close();

    setTimeout(function() {
        process.exit(1);
    }, 5000);
}

if(require.main === module) {
    var conf = new Config("config.json");
    var server = new Server(conf);
    server.run();
}

exports.Server = Server;
exports.Config = Config;
