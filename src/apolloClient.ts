import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
const GRAPHQL_URL = "https://graphql-pokemon2.vercel.app";
export const client = new ApolloClient({ link: new HttpLink({ uri: GRAPHQL_URL }), cache: new InMemoryCache() });
