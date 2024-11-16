const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID, GraphQLNonNull, GraphQLFloat, GraphQLBoolean } = require('graphql');
const { getAnnonces, getAnnonceById, addAnnonce } = require('./resolvers');

// Définition du type Annonce
const AnnonceType = new GraphQLObjectType({
  name: 'Annonce',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    propertyType: { type: GraphQLString },
    publicationStatus: { type: GraphQLString },
    propertyStatus: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    availabilityDate: { type: GraphQLString },
    photos: { type: new GraphQLList(GraphQLString) },
    userName: { type: GraphQLString },
  }),
});

// Définition des requêtes
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    annonces: {
      type: new GraphQLList(AnnonceType),
      resolve: getAnnonces,
    },
    annonce: {
      type: AnnonceType,
      args: { id: { type: GraphQLID } },
      resolve: getAnnonceById,
    },
  },
});

// Définition des mutations
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addAnnonce: {
      type: AnnonceType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        propertyType: { type: new GraphQLNonNull(GraphQLString) },
        publicationStatus: { type: new GraphQLNonNull(GraphQLString) },
        propertyStatus: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        availabilityDate: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: addAnnonce,
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
