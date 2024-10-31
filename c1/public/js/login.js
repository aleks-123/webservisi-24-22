const login = async (email, password) => {
  try {
    const res = await Axios({
      method: 'POST',
      url: '/api/v1/login',
      data: {
        email,
        password,
      },
    });
    console.log(res);
    window.location.hred = '/viewMovies';
  } catch (err) {
    console.log(err.message);
  }
};

document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
