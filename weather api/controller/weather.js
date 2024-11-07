const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.getCity = async (req, res) => {
  const key = '2cf6f21794e165121aab02c23946cc7e';
  const city = req.params.city;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;

  const data = await fetch(url);
  const weatherData = await data.json();
  res.send(weatherData);
};
