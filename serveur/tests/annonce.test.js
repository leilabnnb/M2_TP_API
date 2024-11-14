const request = require('supertest');
const app = require('../app');
const path = require('path');

let token;

describe('Annonce API', () => {
    beforeAll(async () => {
        // Enregistrer un utilisateur agent
        await request(app).post('/user/register').send({
            username: 'agentuser',
            password: 'agentpassword',
            isAgent: true,
        });
        // Se connecter pour obtenir un token
        const res = await request(app).post('/user/login').send({
            username: 'agentuser',
            password: 'agentpassword',
        });
        token = res.body.token;
    });

    it('should add a new annonce', async () => {
        const res = await request(app)
            .post('/annonce')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Test Maison')
            .field('propertyType', 'À la vente')
            .field('publicationStatus', 'Publiée')
            .field('propertyStatus', 'Disponible')
            .field('description', 'Description de la maison')
            .field('price', '200000')
            .field('availabilityDate', '2024-12-31T00:00:00Z')
            .attach('photos', path.resolve(__dirname, 'test_photo.jpg'));

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('title', 'Test Maison');
    });

    it('should get the list of annonces', async () => {
        const res = await request(app)
            .get('/annonce')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
});
