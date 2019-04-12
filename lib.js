const axios = require("axios")

class PokemonAPI {
  constructor() {
    this.baseUrl = "https://pokeapi.co/api/v2"
  }

  async getPokemon(pokemonName) {
    const pokemonUrl = `${this.baseUrl}/pokemon/${pokemonName}`
    const res = await axios.get(pokemonUrl)
    const pokemon = await res.data

    return pokemon
  }
}

module.exports = PokemonAPI
