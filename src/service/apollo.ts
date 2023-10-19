import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
    uri: 'https://wpe-hiring.tokopedia.net/graphql',
    cache: new InMemoryCache(),
  });