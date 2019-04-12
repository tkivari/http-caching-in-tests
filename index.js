const express = require("express")
const PokeLib = require("./lib")
// Set up the express app
const app = express()
// get all todos
app.get("/api/v1/pokemon/:pokemon", async (req, res) => {
  const pokeLib = new PokeLib()
  let data
  let code = 200
  let success = true
  let start = +new Date()
  let end = 0

  try {
    data = await pokeLib.getPokemon(req.params.pokemon)
    end = +new Date()
  } catch (e) {
    console.log(e)
    code = 500
    success = false
    data = e
  }

  res.status(code).send({
    success,
    time: end - start,
    code,
    data,
  })
})
const PORT = 5000

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})

module.exports = app
