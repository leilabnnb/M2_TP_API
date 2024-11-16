const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Le serveur tourne sur le port ${port}`);
    console.log(`GraphQL disponible à http://localhost:${port}/graphql`);
});


