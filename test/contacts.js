var server = require("../server");
var request = require("supertest");
var app;

describe("Contact API", function() {
    before(function(done) {
        testServer = new server.Server();
        testServer.run();
        app = testServer.app;
        done();
    });

    after(function(done) {
        testServer.server.close();
        done();
    });

    it("GET /contacts should return 200", function(done) {
        request(app)
          .get("/contacts")
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

    it("POST /contacts with start and call should return 200", function(done) {
        request(app)
          .post("/contacts")
          .send({call: "AB1CDE", start: "2012-12-21T18:00:00.000Z"})
          .expect(200, done);
    });
});
