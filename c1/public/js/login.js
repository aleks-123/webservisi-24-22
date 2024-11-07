const login = async (email, password, year, title) => {
  try {
    const res = await Axios({
      method: 'POST',
      url: `/api/v1/login`,
      data: {
        email,
        password,
      },
    });
    console.log(res);

    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year);
    if (title) queryParams.append('title', title);
    if (page)
      // /viewMovies?year=2020&title=evrovizija
      window.location.href = `/viewMovies?${queryParams.toString}`;
  } catch (err) {
    console.log(err.message);
  }
};

document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const searchByYear = document.getElementById('year').value;
  const searchByTitle = document.getElementById('title').value;
  login(email, password, searchByYear, searchByTitle);
});
