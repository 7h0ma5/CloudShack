var server = require("../server");
var Config = require("../lib/config");
var data = require("../lib/data");
var request = require("supertest");
var assert = require("assert");

describe("Data API", function() {
    var app;

    before(function(done) {
        this.timeout(10000);

        var conf = new Config("test-config.json");
        var local = {address: "http://127.0.0.1:5984", name: "test_contacts"};
        conf.set("db.local", local)

        var testServer = new server.Server(conf);
        app = testServer.app;

        // remove functions
        data.updateBand = [42];
        data.migrateMode = [42];

        // give the server time to initialize the database
        setTimeout(done, 5000);
    });

    it("GET /data should return all data", function(done) {
        request(app)
          .get("/data")
          .expect("Content-Type", /json/)
          .expect(200)
          .expect(function(res) {
              assert.deepEqual(res.body, data);
           })
          .end(done);
    });

    for (var key in data) {
        (function(key) {
            it("GET /data/" + key + " should return 200", function(done) {
                request(app)
                  .get("/data/" + key)
                  .expect("Content-Type", /json/)
                  .expect(200)
                  .expect(function(res) {
                      assert.deepEqual(res.body, data[key]);
                   })
                  .end(done);
            });
        })(key);
    }

    it("GET /data/unknown should return 404", function(done) {
        request(app)
          .get("/data/unknown")
          .expect(404, done);
    });
});
