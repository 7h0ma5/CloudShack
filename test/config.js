var Config = require("../lib/config");
var request = require("supertest");
var assert = require("assert");

var testConfig = {
    "level1a": {
        "level2a": {
            "level3a": 123
        }
    },
    "level1b": {
        "level2a": {
            "level3a": true,
            "level3b": "foo"
        }
    }
};

var testFile = "test-config-lib.json";

describe("Config Lib", function() {
    var conf;

    before(function() {
        conf = new Config(testFile);
    });

    beforeEach(function() {
        conf.setAll(testConfig);
    });

    it("should setAll", function() {
        assert.deepEqual(conf.getAll(), testConfig);
    });

    it("should load the config", function() {
        conf.save();
        var loadConf = new Config(testFile);
        assert.deepEqual(loadConf.getAll(), testConfig);
    });

    it("should get a keypath", function() {
        assert.equal(conf.get("level1a.level2a.level3a"),
                     testConfig["level1a"]["level2a"]["level3a"]);
        assert.equal(conf.get("level1b.level2a.level3a"),
                     testConfig["level1b"]["level2a"]["level3a"]);
        assert.equal(conf.get("level1b.level2a.level3b"),
                     testConfig["level1b"]["level2a"]["level3b"]);

        assert.deepEqual(conf.get("level1a"), testConfig["level1a"]);
        assert.deepEqual(conf.get("level1b"), testConfig["level1b"]);

        assert.deepEqual(conf.get("level1a.level2a"),
                         testConfig["level1a"]["level2a"]);

        assert.deepEqual(conf.get("level1b.level2a"),
                         testConfig["level1b"]["level2a"]);
    });

    it("should return null on an unknown keypath", function() {
        assert.equal(conf.get("level1c"), null);
        assert.equal(conf.get("level1a.level2b"), null);
        assert.equal(conf.get("level1a.level2a.level3c"), null);
    });

    it("should automatically create a new keypath", function() {
        conf.set("level1c.level2a.level3a", 123);
        assert.deepEqual(conf.get("level1c"), {"level2a": {"level3a": 123}});
    });

    it("should call the update callback", function() {
        var called = false;

        conf.observe("level1a.level2a.level3a", function() {
            called = true;
        });

        assert.equal(called, false);
        conf.set("level1a.level2a.level3a", 987);
        assert.equal(called, true);
    });

    it("should call the update callback instantly", function() {
        var called = false;

        conf.observe("level1a.level2a.level3a", function() {
            called = true;
        }, true);

        assert.equal(called, true);
    });

    it("should return everything with getAll", function() {
        assert.deepEqual(conf.getAll(), testConfig);
    });
});
