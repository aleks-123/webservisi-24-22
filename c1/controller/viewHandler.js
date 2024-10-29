const Movie = require('../pkg/movies/movieSchema');

exports.getLoginForm = (req, res) => {
  try {
    res.status(200).render('login', {
      title: 'Login form',
      subTitle: 'This form is required for acces to our movie platform',
    });
  } catch (err) {
    res.status(500).send('Errror');
  }
};

exports.movieView = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).render('homepage', {
      title: 'Welcome to HBO',
      subTitle: 'This form is required for acces to our movie platform',
      movies,
    });
  } catch (err) {
    res.status(500).send('Errror');
  }
};

exports.mineMovies = async (req, res) => {
  try {
    const userId = req.auth.id;
    const clientMovies = await Movie.find({ author: userId });
    res.status(200).render('myprofile', {
      title: 'Mine movies',
      movies: clientMovies,
    });
  } catch (err) {
    res.status(500).send('Errror');
  }
};
