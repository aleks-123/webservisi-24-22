const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

let cache = {};

exports.getCity = async (req, res) => {
  const key = '2cf6f21794e165121aab02c23946cc7e';
  const city = req.params.city;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;

  // cache = {
  //   ohrid: {
  //     localCache: {
  //       grad: 'ohrid',
  //       temperatura: '22stepeni',
  //     },
  //     cacheTime: 923952359235,
  //   },
  //   skopje: {
  //     localCache: {
  //       grad: 'skopje',
  //       temperatura: '22stepeni',
  //     },
  //     cacheTime: 923952359235,
  //   },
  // };

  if (
    cache[req.params.city] &&
    cache[req.params.city].cacheTime !== null &&
    cache[req.params.city].cacheTime + 5 * 1000 < new Date().getTime()
  ) {
    cache[req.params.city].localCache = null;
  }

  if (!cache[req.params.city] || cache[req.params.city].localCache === null) {
    const data = await fetch(url);
    cache[req.params.city] = {
      localCache: await data.json(),
      cacheTime: Date.now(),
    };
  }

  res.send(cache);

  // const data = await fetch(url);
  // const weatherData = await data.json();
  // res.send(weatherData);
};
