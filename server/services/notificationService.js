
const Reservation = require('../models/Reservation');
const Member = require('../models/Member');
const Book = require('../models/Book');

// This would be set up with actual email credentials
const emailConfig = {
  username: "",  // To be provided by user
  password: "",  // To be provided by user
  serviceId: ""  // To be provided by user
};

// Function to check for pending notifications
const checkPendingNotifications = async () => {
  try {
    // Find reservations that need notification
    const pendingNotifications = await Reservation.find({
      status: 'pending',
      notificationSent: false
    })
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    console.log(`Found ${pendingNotifications.length} pending notifications`);
    
    for (const reservation of pendingNotifications) {
      // Check if the book is actually available
      const book = await Book.findById(reservation.bookId);
      
      if (book && book.availableCopies > 0) {
        // Book is available, send notification
        await sendBookAvailableNotification(
          reservation.memberId.email,
          reservation.memberId.name,
          book.title,
          book.author
        );
        
        // Mark notification as sent
        await Reservation.findByIdAndUpdate(
          reservation._id,
          { notificationSent: true }
        );
        
        console.log(`Notification sent for reservation ${reservation._id}`);
      }
    }
  } catch (error) {
    console.error('Error checking pending notifications:', error);
  }
};

// Function to send notification email
const sendBookAvailableNotification = async (email, memberName, bookTitle, authorName) => {
  try {
    // Here we would use EmailJS or another email service to send the email
    console.log(`Sending email notification to ${email}`);
    console.log(`Dear ${memberName}, the book "${bookTitle}" by ${authorName} is now available.`);
    console.log(`Please visit the library within 48 hours to check out this book.`);
    
    // In a real implementation, we would use actual email sending here
    // EmailJS or nodemailer would be implemented here
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Function to start the notification service
const startNotificationService = (interval = 15 * 60 * 1000) => {  // Default: check every 15 minutes
  console.log(`Starting notification service with interval: ${interval}ms`);
  
  // Check immediately on startup
  checkPendingNotifications();
  
  // Then check at the specified interval
  return setInterval(checkPendingNotifications, interval);
};

module.exports = {
  startNotificationService,
  sendBookAvailableNotification,
  checkPendingNotifications
};
