const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const isValid = (username) => users.some((user) => user.username === username);
const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

// Task 8: Log in using a JWT stored in the user's session.
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const accessToken = jwt.sign(
    { username },
    process.env.JWT_SECRET || 'access',
    { expiresIn: '1h' }
  );
  req.session.authorization = { accessToken };
  return res.status(200).send('User successfully logged in');
});

// Task 9: Add or modify the logged-in user's review.
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.query.review ?? req.body?.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Review text is required' });
  }

  book.reviews[req.user.username] = review.trim();
  return res.json({ message: 'Review added/updated successfully', reviews: book.reviews });
});

// Task 10: Delete only the logged-in user's review.
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) {
    return res.status(404).json({ message: 'No review by this user to delete' });
  }

  delete book.reviews[req.user.username];
  return res.json({ message: `Review for ISBN ${req.params.isbn} deleted` });
});

module.exports = { authenticated: regd_users, isValid, authenticatedUser, users };
