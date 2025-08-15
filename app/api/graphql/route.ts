import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '@/lib/graphql/schema'
import { resolvers } from '@/lib/graphql/resolvers'
import { auth } from '@/auth'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (err) => {
    console.error('GraphQL Error Details:', {
      message: err.message,
      locations: err.locations,
      path: err.path,
      source: err.source?.body,
      positions: err.positions,
      extensions: err.extensions
    })
    return err
  },
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    const session = await auth()
    return { req, session }
  },
})

export async function GET(request: Request) {
  return handler(request)
}

export async function POST(request: Request) {
  return handler(request)
}