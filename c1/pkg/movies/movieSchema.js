const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    reqired: [true, 'It must have a title'],
    trim: true,
    minlength: 1,
    maxlength: [225, 'Title is too long'],
    unique: [true, 'Every movie must have unique title'],
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
  },
  genre: {
    type: String,
    enum: ['Action', 'Comedy', 'Drama', 'Science', 'Fantasy'],
  },
  imbdRating: {
    type: Number,
    min: 0,
    max: 10,
  },
  slika: {
    type: String,
    default: 'default.jpg',
  },
  sliki: {
    type: [String],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
