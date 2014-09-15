var server = require("../server");
var config = require("../lib/config");
var request = require("supertest");
var assert = require("assert");

describe("Contact API", function() {
    var app;

    var testContact = {
        call: "AB1CDE",
        start: "2012-12-21T18:00:00.000Z"
    };

    before(function(done) {
        this.timeout(10000);

        var conf = new config.Config("test-config.json");
        var local = {address: "http://127.0.0.1:5984", name: "test_contacts"};
        conf.set("db.local", local)

        var remote = {address: "http://127.0.0.1:5984", name: "test_contacts_remote"};
        conf.set("db.remote", remote);

        var testServer = new server.Server(conf);
        app = testServer.app;

        // give the server time to initialize the database
        setTimeout(done, 5000);
    });

    it("GET /contacts should return 200", function(done) {
        request(app)
          .get("/contacts")
          .expect("Content-Type", /json/)
          .expect(200, done);
    });

    it("POST /contacts without call should return 403", function(done) {
        request(app)
          .post("/contacts")
          .send({start: "2012-12-21T18:00:00.000Z"})
          .expect(403, done);
    });

    it("POST /contacts without start should return 403", function(done) {
        request(app)
          .post("/contacts")
          .send({call: "AB1CDE"})
          .expect(403, done);
    });

    it("GET /contacts/unknown_key should return 404", function(done) {
        request(app)
          .get("/contacts/unknown_key")
          .expect(404, done);
    });

    it("DELETE /contacts/unknown_key/unknown_rev should return 404", function(done) {
        request(app)
          .delete("/contacts/unknown_key/unknown_rev")
          .expect(404, done);
    });

    var contact = null;

    it("POST /contacts with start and call should return 200", function(done) {
        request(app)
          .post("/contacts")
          .send(testContact)
          .expect("Content-Type", /json/)
          .expect(200).end(function(error, res) {
              contact = res.body;
              done();
          });
    });

    it("GET /contacts/:id should return 200", function(done) {
        request(app)
          .get("/contacts/" + contact.id)
          .expect("Content-Type", /json/)
          .expect(200)
          .expect(function(res) {
              assert.equal(res.body._id, contact.id);
              assert.equal(res.body.call, testContact.call);
              assert.equal(res.body.start, testContact.start);
           })
          .end(done);
    });

    it("DELETE /contacts/:id/:rev should return 200", function(done) {
        request(app)
          .delete("/contacts/" + contact.id + "/" + contact.rev)
          .expect(200, done);
    });
});
