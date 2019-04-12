"use strict"

var nock = require("nock")
var sanitize = require("sanitize-filename")

module.exports = function(fixtures) {
  var filenames = []
  return {
    beforeEach: function(done) {
      var filename = sanitize(this.currentTest.title + ".json")
      // make sure we're not reusing the nock file
      if (filenames.indexOf(filename) !== -1) {
        return done(
          new Error(
            "nock-back-mocha does not support multiple tests with the same name. " +
              filename +
              " cannot be reused.",
          ),
        )
      }
      filenames.push(filename)

      nock.back.setMode("record")

      var previousFixtures = nock.back.fixtures
      nock.back.fixtures = fixtures

      nock.back(
        filename,
        function(nockDone) {
          this.currentTest.nockDone = function() {
            nockDone()
            nock.back.fixtures = previousFixtures
          }

          nock.enableNetConnect(/127\.0\.0\.1/)
          done()
        }.bind(this),
      )
    },
    afterEach: function() {
      this.currentTest.nockDone()
    },
  }
}
