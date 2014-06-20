var xmlrpc = require("xmlrpc"),
    util = require("util");

var RawString = function(value) {
    xmlrpc.CustomType.call(this, value);
}

util.inherits(RawString, xmlrpc.CustomType);

RawString.prototype.serialize = function(xml) {
    return xml.txt(this.raw);
}

var Fldigi = function(port) {
    var params = { host: "127.0.0.1", port: port };
    var server = xmlrpc.createServer(params);
    server.on("log.add_record", this.addRecord);
    server.on("log.check_dup", this.checkDup);
    server.on("system.listMethods", this.listMethods);

    server.on('NotFound', function(method, params) {
        console.log('Method ' + method + ' does not exist');
    });
};

Fldigi.prototype.addRecord = function(err, params, callback) {
    console.log("addlog" + params);
    callback(null, new RawString(""));
};

Fldigi.prototype.checkDup = function(err, params, callback) {
    console.log("checkdup" + params);
    callback(null, new RawString(""));
};

Fldigi.prototype.listMethods = function(err, params, callback) {
    callback(null, [
        new RawString("log.add_record"),
        new RawString("log.check_dup"),
        new RawString("log.get_record"),
        new RawString("system.listMethods"),
        new RawString("system.methodHelp"),
        new RawString("system.multicall")
    ]);
};

var test = new Fldigi(8421);
