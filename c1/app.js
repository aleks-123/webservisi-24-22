const express = require('express');
const db = require('./pkg/db/index');
const movies = require('./controller/movie');
const authHandler = require('./controller/authHandler');
const jwt = require('express-jwt');

//! npm install express-jwt

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(loggerMiddleware);
db.init();

app.use(
  jwt
    .expressjwt({
      algorithms: ['HS256'],
      secret: process.env.JWT_SECRET,
    })
    .unless({
      path: ['/api/v1/signup', '/api/v1/login'],
    })
);

function loggerMiddleware(req, res, next) {
  console.log(`[${new Date().toDateString()}] ${req.method} ${req.url}`);
  next();
}

app.use(loggerMiddleware);
const test = (req, res, next) => {
  req.info = 'WELCOME FROM MIDDELWARE';
  req.welcome = 'Biggest welcome';
  next();
};
app.use(test);

app.post('/api/v1/signup', authHandler.signup);
app.post('/api/v1/login', authHandler.login);

app.get('/movies', movies.getAll);
app.get('/movies/:id', movies.getOne);
app.post('/movies', movies.create);
app.patch('/movies/:id', movies.update);
app.delete('/movies/:id', movies.delete);

app.post('/api/moviesbyuser', movies.createByUser);
app.get('/api/moviesbyuser', movies.getByUser);

app.listen(10000, (err) => {
  if (err) {
    return console.log('Could not start service');
  }
  console.log(`Service started successfully on port 10000`);
});
