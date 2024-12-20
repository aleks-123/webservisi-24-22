const User = require('../pkg/users/userSchema');
//! npm install jsonwebtoken
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const sendMail = require('../pkg/mail/emailService');
const sendMailgun = require('../pkg/mail/mailgun');
const crypto = require('crypto');

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const token = jwt.sign({ id: newUser._id, name: newUser.name, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.cookie('jwt', token, {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      secure: false,
      httpOnly: true,
    });

    await sendMail({
      email: newUser.email,
      subject: 'Registracija na Nike Shoes',
      message: `Vi blagodarime na doverbata ${newUser.name}, uspesno kreiravte account na nashata aplikacija`,
    });

    // await sendMailgun({
    //   email: newUser.email,
    //   subject: 'Registracija na Nike Shoes',
    //   message: `Vi blagodarime na doverbata ${newUser.name}, uspesno kreiravte account na nashata aplikacija`,
    // });

    res.status(201).json({
      status: 'success',
      // token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //* 1. Proveruvame dali ima vneseno pasvord i email
    if (!email || !password) {
      return res.status(400).send('Please provide email and password');
    }

    //* 2. Proveruvame dali korinsikot postoi
    const user = await User.findOne({ email });
    console.log('user', user);
    if (!user) {
      return res.status(401).send('Invalid email or password!');
    }

    //* 3. Sporeduvame password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log('is password valid', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid email or password!');
    }

    //* 4. Se geneira i isprakja token
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
    console.log('token', token);

    //* 5. Se generia i isprakja cookie
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),

      secure: false,
      httpOnly: true,
    });

    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //* 1) Go zemame tokenot i proveruvame dali e tamu
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    console.log(token);

    if (!token) {
      return res.status(400).send('You are not logged i, please log in');
    }

    //* 2) Vo verifikuvame tokenot i dekodirame
    function verifyToken(token) {
      return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
          if (err) {
            reject(new Error('Token verification failed'));
          }
          resolve(decodedToken);
        });
      });
    }
    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
      return res.send('Token is not valid');
    }

    // const verifyAsync = promisify(jwt.verify);
    // const decoded = await verifyAsync(token, process.env.JWT_SECRET);

    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).send('User doesnt longer exist');
    }

    req.auth = user;
    next();
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
  // req.header
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log(req.query);
    console.log(req.auth);

    if (req.auth.role !== 'admin') {
      res.status(404).send('YOU DONT HAVE PERMISION, YOU ARE NOT ADMIN');
    }
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      lengthMovies: movies.length(),
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

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send('This user doesnt exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;

    const message = `Ja zaboravivte lozinkata, ve molime iskoristete Patch requiest so vashata nova lozina na ova url ${resetUrl}`;

    await sendMail({
      email: user.email,
      subject: 'Vashiot resetiracki token (30 minuti validen)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token send to email',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // 1) Go dobivame tokenot
    const token = req.params.token;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    // 2) go dobivame korisnikot sto gi ima toj token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).send('Korisnikot ne e pronajden, tokenot e istecen');
    }

    // 3) promena na korisnickata lozinka
    user.password = req.body.password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    // 4) opcionalno isprakjame jwt token
    // const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES,
    // });

    res.status(201).json({
      status: 'success',
      message: 'Uspesno promeneta lozinka',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
