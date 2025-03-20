
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/books
// @desc    Add a new book
// @access  Public
router.post('/', async (req, res) => {
  const { 
    title, 
    author, 
    isbn, 
    publishedYear, 
    genre, 
    description, 
    status, 
    coverImage 
  } = req.body;
  
  try {
    // Check if book with the ISBN already exists
    let book = await Book.findOne({ isbn });
    
    if (book) {
      return res.status(400).json({ msg: 'Book with this ISBN already exists' });
    }
    
    book = new Book({
      title,
      author,
      isbn,
      publishedYear,
      genre,
      description,
      status,
      coverImage
    });
    
    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/books/:id
// @desc    Update a book
// @access  Public
router.put('/:id', async (req, res) => {
  const { 
    title, 
    author, 
    isbn, 
    publishedYear, 
    genre, 
    description, 
    status, 
    coverImage 
  } = req.body;
  
  // Build book object
  const bookFields = {};
  if (title) bookFields.title = title;
  if (author) bookFields.author = author;
  if (isbn) bookFields.isbn = isbn;
  if (publishedYear) bookFields.publishedYear = publishedYear;
  if (genre) bookFields.genre = genre;
  if (description) bookFields.description = description;
  if (status) bookFields.status = status;
  if (coverImage) bookFields.coverImage = coverImage;
  
  try {
    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    // Check if updating to an ISBN that already exists
    if (isbn && isbn !== book.isbn) {
      const isbnExists = await Book.findOne({ isbn });
      if (isbnExists) {
        return res.status(400).json({ msg: 'ISBN already in use by another book' });
      }
    }
    
    book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: bookFields },
      { new: true }
    );
    
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/books/:id
// @desc    Delete a book
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    await Book.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
