const request = require('supertest');
const app = require('../app');
const path = require('path');
const mongoose = require('mongoose');

let agentToken, userToken, annonceId, questionId;

beforeAll(async () => {
    // Enregistrer un utilisateur agent
    await request(app).post('/user/register').send({
        username: 'agentuser',
        password: 'agentpassword',
        isAgent: true,
    });

    // Enregistrer un utilisateur
    await request(app).post('/user/register').send({
        username: 'user',
        password: 'password',
    });

    // Se connecter pour obtenir un token agent
    const res = await request(app).post('/user/login').send({
        username: 'agentuser',
        password: 'agentpassword',
    });
    agentToken = res.body.token;

    // Se connecter pour obtenir un token utilisateur
    const res2 = await request(app).post('/user/login').send({
        username: 'user',
        password: 'password',
    });
    userToken = res2.body.token;

});

afterAll(async () => {
    await mongoose.connection.close();

});


describe('Annonce API', () => {

    it('should get the list of annonces (Public routes)', async () => {
        const res = await request(app).get('/annonce');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should allow agent to add a new annonce', async () => {
        const res = await request(app)
            .post('/annonce')
            .set('Authorization', `Bearer ${agentToken}`)
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
        annonceId = res.body._id;
    });

    it('should allow anyone to get annonce by ID', async () => {
        console.log('Testing getAnnonceById with annonceId:', annonceId);
        const res = await request(app).get(`/annonce/${annonceId}`);
        console.log('Response body:', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', annonceId);
    });

    it('should allow authenticated user to ask a question', async () => {
        const res = await request(app)
            .put(`/annonce/${annonceId}/ask`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ question: 'Est-ce que cette maison est toujours disponible ?' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.questions.length).toBeGreaterThan(0);
        questionId = res.body.questions[0]._id;
    });

    it('should allow agent to answer a question', async () => {
        const res = await request(app)
            .put(`/annonce/${annonceId}/question/${questionId}/answer`)
            .set('Authorization', `Bearer ${agentToken}`)
            .send({ answer: 'Oui, elle est toujours disponible.' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.questions[0].answers.length).toBeGreaterThan(0);
    });

    it('should not allow normal user to delete annonce', async () => {
        const res = await request(app)
            .delete(`/annonce/${annonceId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(403);
    });

    it('should allow agent to update an annonce', async () => {
        const res = await request(app)
            .put(`/annonce/${annonceId}`)
            .set('Authorization', `Bearer ${agentToken}`)
            .send({ title: 'Maison mise à jour' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('title', 'Maison mise à jour');
    });

    it('should allow agent to delete annonce', async () => {
        const res = await request(app)
            .delete(`/annonce/${annonceId}`)
            .set('Authorization', `Bearer ${agentToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Annonce supprimée avec succès');
    });


});
