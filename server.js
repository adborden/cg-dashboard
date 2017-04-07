import path from 'path';
import express from 'express';
import morgan from 'morgan';

import cookieSession from 'cookie-session';
import { auth, home, api } from './controllers';

const app = express();
const port = process.env.PORT || 8080;


app.use(morgan('combined')); // logging middleware
app.use(cookieSession({
  name: 's',
  keys: [process.env.SESSION_KEY],
  maxAge: 7 * 24 * 3600,
  httpOnly: true,
  secure: process.env.SECURE_COOKIES === '0' || true,
  signed: true
}));

// Static routes
app.use('/assets', express.static(path.join(__dirname, 'static', 'assets')));
app.get('/favicon.ico', (req, res) => {
  res.status(404).send('Not found');
});

app.get('/', home);

// Authorized-only endpoints
app.use('/auth', auth.init(app));
app.use('/api', api.init());

const server = app.listen(port, 'localhost', () => {
  const address = server.address();
  console.log(`Listening on http://${address.address}:${address.port}`); // eslint-disable-line
});
