
const express = require('express');
const router = express.Router();
const Due = require('../models/Due');
const Book = require('../models/Book');
const Member = require('../models/Member');

// @route   GET api/dues
// @desc    Get all dues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const dues = await Due.find()
      .populate('memberId', 'name email')
      .populate('bookId', 'title author')
      .sort({ dueDate: 1 });
    res.json(dues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dues/:id
// @desc    Get due by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const due = await Due.findById(req.params.id)
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    if (!due) {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    
    res.json(due);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/dues
// @desc    Create a new due record (issue a book)
// @access  Public
router.post('/', async (req, res) => {
  const { 
    memberId, 
    bookId, 
    issueDate, 
    dueDate, 
    returnDate, 
    fineAmount, 
    status 
  } = req.body;
  
  try {
    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    // Check if book is available
    if (book.status !== 'available' && !returnDate) {
      return res.status(400).json({ msg: `Book is not available, current status: ${book.status}` });
    }
    
    // Create new due record
    const due = new Due({
      memberId,
      bookId,
      issueDate: issueDate || Date.now(),
      dueDate,
      returnDate,
      fineAmount: fineAmount || 0,
      status: status || 'pending'
    });
    
    // Update book status to borrowed if not being returned immediately
    if (!returnDate) {
      await Book.findByIdAndUpdate(bookId, { status: 'borrowed' });
    }
    
    await due.save();
    
    // Populate member and book data for the response
    const populatedDue = await Due.findById(due._id)
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    res.json(populatedDue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/dues/:id
// @desc    Update a due record (return a book, update fine, etc.)
// @access  Public
router.put('/:id', async (req, res) => {
  const { 
    issueDate, 
    dueDate, 
    returnDate, 
    fineAmount, 
    status 
  } = req.body;
  
  try {
    let due = await Due.findById(req.params.id);
    
    if (!due) {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    
    // Build due object with fields to update
    const dueFields = {};
    if (issueDate) dueFields.issueDate = issueDate;
    if (dueDate) dueFields.dueDate = dueDate;
    if (returnDate !== undefined) dueFields.returnDate = returnDate;
    if (fineAmount !== undefined) dueFields.fineAmount = fineAmount;
    if (status) dueFields.status = status;
    
    // If book is being returned and it wasn't before, update book status
    if (returnDate && !due.returnDate) {
      await Book.findByIdAndUpdate(due.bookId, { status: 'available' });
    }
    
    // If return date is being removed, update book status to borrowed again
    if (returnDate === null && due.returnDate) {
      await Book.findByIdAndUpdate(due.bookId, { status: 'borrowed' });
    }
    
    due = await Due.findByIdAndUpdate(
      req.params.id,
      { $set: dueFields },
      { new: true }
    ).populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    res.json(due);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/dues/:id
// @desc    Delete a due record
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const due = await Due.findById(req.params.id);
    
    if (!due) {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    
    // If book was not returned yet, update its status to available
    if (!due.returnDate) {
      await Book.findByIdAndUpdate(due.bookId, { status: 'available' });
    }
    
    await Due.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Due record removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
