const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
let SECRET_KEY = 'fingerprint_customer';

const isValid = (username) => {
  return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    return { token };
  }
  return null;

}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = authenticatedUser(username, password);
  if (user) {
    req.session.authorization = { accessToken: user.token };

    return res.status(200).send("Login successful, welcome");
  }
  return res.status(401).json({ message: "Invalid username or password" });
});

// Add or modify a book review 
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization) {
    return res.status(403).json({ message: "You must be logged in to post a review" });
  }
  const token = req.session.authorization.accessToken;
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid session, please log in again" });
    }

    const username = decoded.username;
    const { review } = req.body;
    const { isbn } = req.params;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization) {
    return res.status(403).json({ message: "You must be logged in to delete a review" });
  }

  const token = req.session.authorization.accessToken;
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid session, please log in again" });
    }
    const username = decoded.username;
    const { isbn } = req.params; 
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this user on this book" });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
