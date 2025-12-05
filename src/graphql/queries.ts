import { gql } from "@apollo/client";
export const GET_POKEMONS = gql`
  query getPokemons($first: Int!) { pokemons(first: $first) { id number name image types } }
`;
export const GET_POKEMON = gql`
  query getPokemon($name: String) {
    pokemon(name: $name) { id number name image types classification maxCP maxHP resistant weaknesses weight { minimum maximum } height { minimum maximum } evolutions { id number name image } }
  }
`;
