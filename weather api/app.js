const express = require('express');
const weather = require('./controller/weather');

const app = express();

app.get('/api/v1/weather/:city', weather.getCity);

app.listen(10000, (err) => {
  if (err) {
    console.log('Could not start a service');
    return;
  }
  console.log('Service started successfully');
});
