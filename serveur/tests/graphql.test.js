const request = require("supertest");
const app = require('../app');
const mongoose = require('mongoose');

let server;

jest.setTimeout(30000); // Augmente le délai global des tests à 30 secondes

beforeAll((done) => {
    server = app.listen(0, () => { // Utilise un port dynamique
        console.log(`Test server running on port ${server.address().port}`);
        done();
    });
});

afterAll(async () => {
    await mongoose.connection.close(); // Ferme la connexion MongoDB
    await new Promise((resolve) => server.close(resolve)); // Assure la fermeture complète du serveur
});

describe("GraphQL API Tests", () => {

    it("should return an error for no existing fields", async () => {
        const query = `
            query{
                annonce(id:"5f9b1b3b3b4b1b1b1b1b1b1b"){
                    nonExistingField
                }
            }`;
        const response = await request(server).post("/graphql").send({query});
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('Cannot query field "nonExistingField"');
    }, 10000); // Timeout spécifique de 10 secondes pour ce test

    it('devrait renvoyer une erreur si un champ obligatoire est manquant', async () => {
        const mutation = `
            mutation {
              addAnnonce(
                title: "Nouvelle Maison",
                propertyType: "À la vente",
                publicationStatus: "Publiée",
                propertyStatus: "Disponible",
                description: "Belle maison avec jardin",
                price: 250000
              ) {
                id
                title
              }
            }
        `;

        const response = await request(server)
            .post('/graphql')
            .send({ query: mutation });

        // Vérifie que l'erreur concerne le champ `availabilityDate`
        expect(response.body.errors[0].message).toContain('Field "addAnnonce" argument "availabilityDate" of type "String!" is required, but it was not provided.');
    }, 10000); // Timeout spécifique de 10 secondes
});
