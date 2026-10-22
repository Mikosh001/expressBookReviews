const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Task 7: Register a new user.
public_users.post('/register', (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = req.body?.password;

  if (!username || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. Now you can login' });
});

// Task 2: Retrieve all books.
public_users.get('/', (req, res) => res.json(books));

// Task 3: Retrieve a book by ISBN (the sample database uses ISBN keys 1–10).
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.json(book);
});

function findBooks(field, value) {
  const target = value.trim().toLocaleLowerCase();
  return Object.fromEntries(
    Object.entries(books).filter(([, book]) => book[field].toLocaleLowerCase() === target)
  );
}

// Task 4: Retrieve books by author.
public_users.get('/author/:author', (req, res) => {
  return res.json(findBooks('author', req.params.author));
});

// Task 5: Retrieve books by title.
public_users.get('/title/:title', (req, res) => {
  return res.json(findBooks('title', req.params.title));
});

// Task 6: Retrieve initial or updated book reviews.
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.json(book.reviews);
});

// Task 11: Axios-based asynchronous clients for the four read operations.
// Start the Express server before calling these functions.
const API_BASE_URL = process.env.BOOKS_API_URL || 'http://127.0.0.1:5000';

async function getAllBooks() {
  const response = await axios.get(`${API_BASE_URL}/`);
  return response.data;
}

async function getBooksByISBN(isbn) {
  const response = await axios.get(`${API_BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await axios.get(`${API_BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await axios.get(`${API_BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
}

module.exports = {
  general: public_users,
  getAllBooks,
  getBooksByISBN,
  getBooksByAuthor,
  getBooksByTitle
};
