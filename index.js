const { ApolloServer, PubSub } = require("apollo-server");
const gql = require("graphql-tag");
const mongoose = require("mongoose");

const resolvers = require("./graphql/resolvers");
const { mongoURI } = require("./config/config");
const typeDefs = require("./graphql/typeDefs");

const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
});

mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB Server");
        return server.listen({ port: 5000 });
    })
    .then(res => {
        console.log(`Server running at port ${5000}`);
    });
