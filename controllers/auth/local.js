/**
 * Controller responsible for handling the logic for Local login
 * (standard login with password & register)
 */

 'use strict';

 const passport          = require('passport');
 const bcrypt            = require('bcrypt');
 const saltRounds        = 10;
 const hat               = require('hat');
 const login             = require('connect-ensure-login');
 const User              = require('../../models').User;
 const authLocalConfig   = require('../../config/auth').get('Local');

 /**
  * Render the index.html or index-with-code.js depending on if query param has code or not
  * @param   {Object} req - The request
  * @param   {Object} res - The response
  * @returns {undefined}
  */
 exports.index = (req, res) => {
   if (req.user) {
     res.redirect('/account');
   } else {
     res.redirect('/login');
   }
 };

/**
 * Render the login.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.login = (req, res) => {
  res.render('auth/local/login', {
    loginUrl: authLocalConfig.loginUrl,
    clientId: req.client.clientId
  });
};

/**
 * Render the register.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.register = (req, res) => {
  res.render('auth/local/register', {
    clientId: req.client.clientId
  });
};

exports.postRegister = (req, res, next) => {
  const errors = [];
  const { firstName, lastName, email } = req.body;
  let {password} = req.body;

  if (errors.length === 0) {
    password = bcrypt.hashSync(password, saltRounds);

    new User({ firstName, lastName, email, password })
      .save()
      .then(() => { res.redirect(authLocalConfig.loginUrl+ '?clientId=' + req.client.clientId); })
      .catch((err) => { next(err) });
  } else {
    req.flash('error', { errors });
    res.redirect('/register');
  }
}

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {

    if (err) { return next(err); }

    // Redirect if it fails to the original e-mail screen
    if (!user) {
      return res.redirect(`${authLocalConfig.loginUrl}?clientId=${req.client.clientId}`);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }

      // Redirect if it succeeds to authorize screen
      const authorizeUrl = `/dialog/authorize?redirect_uri=${req.client.redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
      return res.redirect(authorizeUrl);
    });
  })(req, res, next);
}

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};
