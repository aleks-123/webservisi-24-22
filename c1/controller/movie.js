// req.body - prakjame objekt so koj sakame da go zacuvame vo data baza, najcesto kako json
// req.params - url/parametar
// req.header - samiot browser go kreira -  jwt - koj brower - i red drugi parametri
//* req.file --- objektot na samiot fajl
//? req.query - parametri za prebaruvanje niz data baza ili kverinja

//! npm install multer - biblioteka za dodavanje na fajlovi
//! npm install uuid
const Movie = require('../pkg/movies/movieSchema');
const multer = require('multer');
const uuid = require('uuid');

const imageId = uuid.v4();

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/pictures/movies');
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1];
    console.log(ext);
    callback(null, `movie-${imageId}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new Error('This file type is not supported - only acept images'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadMoviePhoto = upload.single('picture'); // req.file
exports.uploadMuliplePhoto = upload.array('pictures', 3); // req.files

exports.update = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);

    // if (req.file) {
    //   req.body.slika = req.file.filename;
    // }

    if (req.files) {
      console.log(req.files);
      req.body.sliki = req.files.map((file) => file.filename);
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    console.log(req.info);
    const movies = await Movie.find().populate('author');
    res.status(200).json({
      status: 'success',
      data: {
        movies,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.getOne = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        movie: newMovie,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.delete = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.createByUser = async (req, res) => {
  try {
    console.log('user', req.auth);
    const moviePost = await Movie.create({
      title: req.body.title,
      year: req.body.year,
      imbdRating: req.body.imbdRating,
      author: req.auth.id,
    });
    res.status(201).json(moviePost);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const userId = req.auth.id;
    const mineMovies = await Movie.find({ author: userId });

    res.status(201).json(mineMovies);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
