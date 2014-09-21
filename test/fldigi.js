var server = require("../server");
var config = require("../lib/config");
var adif = require("../lib/adif");
var libxml = require("libxmljs");
var request = require("supertest");
var assert = require("assert");

describe("Fldigi API", function() {
    var app;

    var testContact = {
        call: "FL0IGI",
        start: "2012-12-21T18:00:00.000Z",
        end: "2012-12-21T18:15:00.000Z"
    };

    var testInvalid = {
        band: "40M"
    };

    function makeRequest(method, param) {
        var doc = new libxml.Document();
        var callNode = doc.node("methodCall");
        callNode.node("methodName", method);

        if (param) {
            callNode.node("params").node("param").node("value", param);
        }

        return doc.toString();
    }

    before(function(done) {
        this.timeout(10000);

        var conf = new config.Config("test-config.json");
        var local = {address: "http://127.0.0.1:5984", name: "test_contacts"};
        conf.set("db.local", local)

        var testServer = new server.Server(conf);
        app = testServer.app;

        // give the server time to initialize the database
        setTimeout(done, 5000);
    });

    it("POST /RPC2 <system.listMethods> should return 200", function(done) {
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send(makeRequest("system.listMethods"))
          .expect(200, done);
    });

    it("POST /RPC2 <system.methodHelp> should return 200", function(done) {
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send(makeRequest("system.methodHelp"))
          .expect(200, done);
    });

    it("POST /RPC2 with invalid xml should return 400", function(done) {
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send("abc")
          .expect(400, done);
    });

    it("POST /RPC2 <log.add_record> should return 200", function(done) {
        var writer = new adif.AdiWriter([{"value": testContact}]);
        var data = writer.writeFldigiLine();

        var req = makeRequest("log.add_record", data);
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send(req)
          .expect(200, done);
    });

    it("POST /RPC2 <log.add_record> without content should return 400", function(done) {
        var req = makeRequest("log.add_record", "");
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send(req)
          .expect(400, done);
    });

    it("POST /RPC2 <log.get_record> should return 200", function(done) {
        var req = makeRequest("log.get_record", "FL0IGI");
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send(req)
          .expect(200)
          .expect(function(res) {
              var doc;
              assert.doesNotThrow(function() {
                  doc = libxml.parseXml(res.text);
              });

              var value = doc.get("//value");
              assert(value);

              var reader = new adif.AdiReader(value.text());
              var contacts = reader.readAll();

              assert.equal(contacts.length, 1);

              var contact = contacts[0];

              for (key in testContact) {
                  assert.equal(testContact[key], contact[key]);
              }
          })
          .end(done);
    });

    it("POST /RPC2 <log.get_record> without call should return 404", function(done) {
        var req = makeRequest("log.get_record", "");
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send(req)
          .expect(404, done);
    });

    it("POST /RPC2 <log.check_dup> should return 200", function(done) {
        var req = makeRequest("log.check_dup", "FL0IGI");
        request(app)
          .post("/RPC2")
          .type("text/xml")
          .send(req)
          .expect(200, done);
    });
});
