const request = require("supertest");
const app = require('../app');
const mongoose = require('mongoose');


let server;

beforeAll(() => {
    server = app.listen(4000);
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe("GraphQL API Tests", () => {

    it("should return an error for no existing fiels", async () => {
        const query = `
            query{
                annonce(id:"5f9b1b3b3b4b1b1b1b1b1b1b"){
                    nonExistingField
                }
            }`;
        const response = await request(app).post("/graphql").send({query});
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('Cannot query field "nonExistingField"');
    });

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

        const response = await request(app)
            .post('/graphql')
            .send({ query: mutation });

        // Utiliser `toMatch` pour vérifier que l'erreur concerne bien le champ `availabilityDate`
        expect(response.body.errors[0].message).toContain('Field "addAnnonce" argument "availabilityDate" of type "String!" is required, but it was not provided.');
    });

});