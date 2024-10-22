const express = require('express');
const db = require('./pkg/db/index');
const movies = require('./controller/movie');
const authHandler = require('./controller/authHandler');
const jwt = require('express-jwt');

//! npm install express-jwt

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
db.init();

app.use(
  jwt
    .expressjwt({
      algorithms: ['HS256'],
      secret: process.env.JWT_SECRET,
    })
    .unless({
      path: ['/api/v1/sigup', '/api/v1/login', '/movies'],
    })
);

app.post('/api/v1/signup', authHandler.signup);
app.post('/api/v1/login', authHandler.login);

app.get('/movies', movies.getAll);
app.get('/movies/:id', movies.getOne);
app.post('/movies', movies.create);
app.patch('/movies/:id', movies.update);
app.delete('/movies/:id', movies.delete);

app.listen(10000, (err) => {
  if (err) {
    return console.log('Could not start service');
  }
  console.log(`Service started successfully on port 10000`);
});
