const chai = require("chai")
const should = chai.should()
const chaiHTTP = require("chai-http")
const server = require("../index.js")
const { promisify } = require("util")

const r = require("redis"),
  redis = r.createClient()

const getAsync = promisify(redis.get).bind(redis)

chai.use(chaiHTTP)

describe("tests endpoint without API caching", () => {
  let remote_response
  let cached_response

  const dayLength = 60 * 60 * 24

  it("calls the third party API and caches the response", async () => {
    /**
     * This approach is the most robust because we are able to cache responses.
     * We could use a shared Redis instance across multiple instances of the app (e.g. on our test
     * environment), and periodically invalidate our cache and force the API calls to be made
     * in a controlled way, for example, once every 24 hours.
     *
     * When using Redis, you have to make sure that the keys you select for your cache are
     * unique.  When you accidentally duplicate a key name, your data will get messed up!
     *
     * The downside to this approach is that you will cache the responses only from HTTP
     * requests in your tests, which in most of our tests are calls to our internal API.
     * If you would rather cache request responses from third party API requests directly, the caching
     * code would have to be set in the files where the requests are being made, on the condition
     * that the code is being run in a TEST or LOCAL environment.
     *
     */

    const startTime = +new Date()

    const pokemonName = "pikachu"
    const cacheKey = `Pokemon::${pokemonName}`

    let pokemon = await getAsync(cacheKey)

    if (!pokemon) {
      const res = await chai
        .request(server)
        .get(`/api/v1/pokemon/${pokemonName}`)
        .send()

      res.should.have.status(200)

      const {
        body: { data },
      } = res

      pokemon = data

      redis.set(cacheKey, JSON.stringify(pokemon), "EX", dayLength) // set a redis cache item that expires in 24 hours
    } else {
      pokemon = JSON.parse(pokemon)
    }

    const endTime = +new Date()
    const timeToRun = endTime - startTime

    console.log("final value: ", pokemon)

    console.log(`Test complete in ${timeToRun}ms.`)
  })
})
