import { ApolloClient, InMemoryCache, from, createHttpLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { ApolloLink } from '@apollo/client'

// Deep clean function to remove __typename recursively
function deepClean(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(deepClean)
  
  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const key in obj) {
      if (key !== '__typename' && key !== '__ref' && key !== '__id' && obj.hasOwnProperty(key)) {
        cleaned[key] = deepClean(obj[key])
      }
    }
    return cleaned
  }
  
  return obj
}

// Transform link to remove __typename from variables
const removeTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    operation.variables = deepClean(operation.variables)
  }
  return forward(operation)
})

const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
})

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

export const apolloClient = new ApolloClient({
  link: from([removeTypenameLink, errorLink, httpLink]),
  cache: new InMemoryCache({
    addTypename: true, // Keep this for queries
    typePolicies: {
      NewsletterSubscriber: {
        keyFields: ['id'],
      },
      NewsletterCampaign: {
        keyFields: ['id'],
      },
      ShippingZone: {
        keyFields: ['id'],
      },
      ShippingRate: {
        keyFields: ['id'],
      },
      StoreSettings: {
        keyFields: false,
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})