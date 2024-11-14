const request = require('supertest');
const app = require('../app');

describe('User API', () => {
    let token;
    let randomUsername;

    beforeAll((done) => {
        server = app.listen(4000, () => {
            console.log('Test server running on port 4000');
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    it('should register a new user', async () => {
        // Générer un nom d'utilisateur aléatoire pour éviter les conflits
        randomUsername = `testuser${Math.floor(Math.random() * 1000)}`;

        const res = await request(server).post('/user/register').send({
            username: randomUsername,
            password: 'testpassword',
            isAgent: true,
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Utilisateur enregistré avec succès');

    });

    it('should login the user', async () => {
        const res = await request(server).post('/user/login').send({
            username: randomUsername,
            password: 'testpassword',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');

        token = res.body.token;
    });

    it('should return an error for incorrect password', async () => {
        const res = await request(server).post('/user/login').send({
            username: randomUsername,
            password: 'wrongpassword',
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Mot de passe incorrect');
    });

    it('should return an error for non-existent user', async () => {
        const res = await request(server).post('/user/login').send({
            username: 'nonexistentuser',
            password: 'testpassword',
        });

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Utilisateur non trouvé');
    });

});
