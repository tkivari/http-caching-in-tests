const chai = require("chai")
const should = chai.should()
const chaiHTTP = require("chai-http")
const server = require("../index.js")
const path = require("path")

// NOTE:  you MUST run this test in Nock Back mode by setting your local environment variable DEBUG=nock.*, eg:
// DEBUG=nock.* ./node_modules/.bin/mocha test/2.server.nock.test.js --exit

var nockFixtureDirectory = path.resolve(__dirname, "./fixtures")
var nockBackMocha = require("./lib/nock-back")(nockFixtureDirectory)

chai.use(chaiHTTP)

describe("tests endpoint using fixtures for API responses", () => {
  let remote_response
  let cached_response

  beforeEach(nockBackMocha.beforeEach)
  afterEach(nockBackMocha.afterEach)

  it("calls the third party API and gets a response", (done) => {
    /**
     * this approach is better, because API responses will be cached locally and once cached,
     * the API won't be called again.  This approach is good for running tests on our own local
     * environment quickly, but is still somewhat limited because running tests on our test platform will still
     * be very slow unless we want to always use cached responses, which might not be ideal.
     *
     */

    const startTime = +new Date()

    const pokemonName = "pikachu"

    chai
      .request(server)
      .get(`/api/v1/pokemon/${pokemonName}`)
      .send()
      .end((er, res) => {
        res.should.have.status(200)
        const {
          body: { data: pokemon },
        } = res

        const endTime = +new Date()

        const timeToRun = endTime - startTime

        console.log("final value: ", pokemon)

        console.log(`Test complete in ${timeToRun}ms.`)

        done()
      })
  })
})
