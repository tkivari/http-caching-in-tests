const chai = require("chai")
const should = chai.should()
const chaiHTTP = require("chai-http")
const server = require("../index.js")

chai.use(chaiHTTP)

describe("tests endpoint without API caching", () => {
  let remote_response
  let cached_response

  it("calls the third party API and gets a response", (done) => {
    // this approach is not ideal for a couple of reasons:
    // 1: It relies on the third party API to be available when we run our tests.  We don't necessarily want
    //    our unit tests to fail just because a third party service is not working right at the moment.
    // 2: Running our test suite with multiple calls to third party APIs will slow down our test suite, leading
    //    to solutions such as not running tests that make remote calls locally and only checking whether they
    //    work once we push the branch remotely.

    const startTime = +new Date()

    const pokemonName = "charmander"

    chai
      .request(server)
      .get(`/api/v1/pokemon/${pokemonName}`)
      .send()
      .end((er, res) => {
        res.should.have.status(200)
        const {
          body: { data: pokemon, time },
        } = res

        const endTime = +new Date()

        const timeToRun = endTime - startTime

        console.log("final value: ", pokemon)

        console.log(`Test complete in ${timeToRun}ms.`)

        done()
      })
  })
})
