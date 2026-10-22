const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'fingerprint_customer',
  resave: false,
  saveUninitialized: false
}));

app.use('/customer/auth', (req, res, next) => {
  const token = req.session?.authorization?.accessToken;
  if (!token) return res.status(401).json({ message: 'User not logged in' });

  jwt.verify(token, process.env.JWT_SECRET || 'access', (error, user) => {
    if (error) return res.status(403).json({ message: 'User not authenticated' });
    req.user = user;
    next();
  });
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = Number(process.env.PORT) || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
