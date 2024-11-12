const express = require('express');
const db = require('./pkg/db/index');
const movies = require('./controller/movie');
const authHandler = require('./controller/authHandler');
const viewHandler = require('./controller/viewHandler');
const jwt = require('express-jwt');
const cookieParser = require('cookie-parser');

//! npm install express-jwt

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(loggerMiddleware);
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

db.init();

app.use(
  jwt
    .expressjwt({
      algorithms: ['HS256'],
      secret: process.env.JWT_SECRET,
      getToken: (req) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          return req.headers.authorization.split(' ')[1];
        }
        if (req.cookies.jwt) {
          return req.cookies.jwt;
        }
        return null;
      },
    })
    .unless({
      path: ['/api/v1/signup', '/api/v1/login', '/login', '/movies', '/movies/:id', '/forgotpassword'],
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
app.post('/forgotpassword', authHandler.forgotPassword);
app.patch('/resetpassword/:token', authHandler.resetPassword);

app.get('/movies', movies.getAll);

app.get('/movies/:id', movies.getOne);
app.post('/movies', movies.create);
app.patch('/movies/:id', movies.uploadMuliplePhoto, movies.update);
app.delete('/movies/:id', movies.delete);

app.post('/api/moviesbyuser', movies.createByUser);
app.get('/api/moviesbyuser', movies.getByUser);

//! view handlers
app.get('/login', viewHandler.getLoginForm);
// app.get('/viewMovies', viewHandler);

app.listen(10000, (err) => {
  if (err) {
    return console.log('Could not start service');
  }
  console.log(`Service started successfully on port 10000`);
});
