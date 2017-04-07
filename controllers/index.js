
import fs from 'fs';
import path from 'path';

import axios from 'axios';
import express from 'express';
import passport from 'passport';
import oauth2 from 'passport-oauth2';

import apiProxy from '../api_proxy';

export const auth = {
  init(app) {
    const authRouter = express.Router();

    // Mount the route handlers
    authRouter.get('/login', auth.login);
    authRouter.get('/callback', auth.callback);


    // Initialize passport for OAuth
    app.use(passport.initialize());
    app.use((req, res, next) => {
      console.log({ user: req.user });
      next();
    });

    passport.use(new oauth2.Strategy({
      authorizationURL: `${process.env.LOGIN_URL}oauth2/authorize`,
      tokenURL: `${process.env.LOGIN_URL}oauth2/token`,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL}/auth/callback`
    },
    function(accessToken, refreshToken, profile, cb) {
      // There's no user to lookup, so we just return the data as a simple
      // user modlel.
      cb(null, {
        accessToken,
        profile,
        refreshToken
      });
    }));

    return authRouter;
  },

  callback(req, res) {
  },

  login(req, res) {
    passport.authenticate('oauth2')(req, res);
  }
};

export function home(req, res) {
  res.sendFile(path.join(path.dirname(__dirname), 'static', 'index.html'));
}

export const api = {
  init() {
    const apiRouter = express.Router();
    const apiClient = axios.create({
      baseUrl: process.env.CF_API_URL
    });

    apiRouter.get('/', apiProxy(apiClient));
    apiRouter.get('/authstatus', api.authStatus);

    return apiRouter;
  },

  authStatus(req, res) {
    if (!req.user) {
      return res.status(401).send({ status: 'unauthorized' });
    }

    return res.send({ status: 'authorized' });
  }
}
