#!/usr/bin/env node

var express = require("express"),
    serveStatic = require('serve-static'),
    sockio = require("socket.io"),
    config = require("./lib/config");

function jsonParamParser(req, res, next) {
    for (prop in req.query) {
        try {
            req.query[prop] = JSON.parse(req.query[prop]);
        }
        catch (e) {}
    }
    next();
}

var Server = exports.Server = function(port) {
    this.config = new config.Config();
    this.port = port || 3000;

    var bodyParser = require("body-parser");

    this.app = express();
    this.app.use(require("errorhandler")());
    this.app.use(require("morgan")("dev"));
    this.app.use(serveStatic(__dirname + "/public"));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.text({type: "text/plain", limit: 10*1024*1024}));
    this.app.use(bodyParser.text({type: "text/xml", limit: 1*1024*1024}))
    this.app.use(jsonParamParser);

    return this;
}

Server.prototype.run = function() {
    var self = this;
    this.server = this.app.listen(this.port);
    this.io = sockio.listen(this.server);

    ["contacts", "profiles", "callbook", "dxcc", "data", "rig", "cluster", "fldigi", "config"]
        .map(function(controllerName) {
            var controller = require("./controllers/" + controllerName);
            controller.setup(self.config, self.app, self.io);
        }
    );

    this.app.get("/shutdown", function(req, res) {
        setTimeout(function() { self.shutdown() }, 1000);
        res.status(200).send({status: "OK"});
    });
}

Server.prototype.shutdown = function() {
    this.server.close();

    setTimeout(function() {
        process.exit(1);
    }, 5000);
}

if(require.main === module) {
    var server = new Server();
    server.run();
}
