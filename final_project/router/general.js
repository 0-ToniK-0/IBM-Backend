const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const newUser =
  {
    username: req.body.username,
    password: req.body.password
  };

  if (!newUser.username || !newUser.password) {
    return res.status(400).send("Username and password are required");
  }

  if (!isValid(newUser.username)) {
    return res.status(400).json("Username already exists, choose another");
  }

  users.push(newUser);

  return res.status(201).json(
    {
      message: "User registered successfully",
      users
    }
  );
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const books = await  import("./booksdb.js"); 
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  let isbn = parseInt(req.params.isbn);
  let book = await Promise.resolve(books[isbn]);

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).send("The book isbn is not available");
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  let authorQuery = req.params.author.toLowerCase();
  let filteredBooks = await Promise.resolve(
    Object.values(books).filter(book => book.author.toLowerCase().includes(authorQuery))
  );
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).send("No books found by the specified author");
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  let titleQuery = req.params.title.toLowerCase();
  let filteredBooks = await Promise.resolve(
    Object.values(books).filter(book => book.title.toLowerCase().includes(titleQuery))
  );
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).send("No books found by the specified author");
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = parseInt(req.params.isbn);
  let filteredBooks = books[isbn];

  if (filteredBooks) {
    filteredBooks = filteredBooks.reviews
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).send("No books found by the specified author");
  }
});

module.exports.general = public_users;
