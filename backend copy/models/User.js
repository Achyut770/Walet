const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
  walletAddress: { 
    type: String, 
    required: true, 
    unique: true,  // Ensure wallet addresses are unique
  },
  referralBalance: { 
    type: Number, 
    default: 0,  // Default to 0 for new users
  },
  // You can add other fields related to the user if needed
  name: { 
    type: String, 
    default: '' 
  },
  email: { 
    type: String, 
    default: '' 
  },
  // ... any other user-specific fields
});

// Create the User model based on the schema
const User = mongoose.model('User', UserSchema);

// Export the User model so it can be used in other parts of the app
module.exports = User;
