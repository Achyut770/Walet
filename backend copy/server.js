import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Initialize dotenv
dotenv.config();

// Initialize the app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection string - gets from .env or uses fallback
const connectionString = process.env.MONGODB_URI || 
  `mongodb+srv://${encodeURIComponent(process.env.MONGO_USERNAME || 'metafrost2025')}:${encodeURIComponent(process.env.MONGO_PASSWORD || 'Millionaire@87')}@${process.env.MONGO_CLUSTER || 'referralcluster.apb9q.mongodb.net'}/${process.env.MONGO_DB || 'referralDB'}?retryWrites=true&w=majority`;

// Connect to MongoDB
mongoose.connect(connectionString)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    // Print sanitized connection string for debugging
    const sanitizedConnectionString = connectionString.replace(/:[^:@]+@/, ':***@');
    console.log('Connection string (sanitized):', sanitizedConnectionString);
  });

// Define Referral Schema
const referralSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  referredUsers: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define Referral model
const Referral = mongoose.model('Referral', referralSchema);

// Helper function to generate a random referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// API Routes

// Root route
app.get('/', (req, res) => {
  res.send('Referral API is running! Use /api/referral endpoints.');
});

// Generate referral code for a user
app.post('/api/referral', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Normalize wallet address to lowercase
    const normalizedAddress = walletAddress.toLowerCase().trim();
    
    // Check if user already has a referral code
    let referral = await Referral.findOne({ walletAddress: normalizedAddress });
    
    if (referral) {
      return res.json({ 
        success: true,
        message: 'Existing referral code retrieved',
        referralCode: referral.referralCode 
      });
    }
    
    // Generate new referral code
    const referralCode = walletAddress;
    
    // Create new referral entry
    referral = new Referral({
      walletAddress: normalizedAddress,
      referralCode,
      referredUsers: []
    });
    
    await referral.save();
    
    res.status(201).json({
      success: true,
      message: 'Referral code generated successfully',
      referralCode: referral.referralCode
    });
    
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate referral code', 
      details: error.message 
    });
  }
});

// Get referral code for a specific wallet address
app.get('/api/referral/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const normalizedAddress = walletAddress.toLowerCase().trim();
    
    const referral = await Referral.findOne({ walletAddress: normalizedAddress });
    
    if (!referral) {
      return res.status(404).json({ 
        success: false,
        error: 'No referral code found for this wallet address' 
      });
    }
    
    res.json({
      success: true,
      referralCode: referral.referralCode
    });
    
  } catch (error) {
    console.error('Error retrieving referral code:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve referral code',
      details: error.message 
    });
  }
});

// Register a referral (when someone uses a referral code)
app.post('/api/referral/register', async (req, res) => {
  try {
    const { walletAddress, referralCode } = req.body;
    
    if (!walletAddress || !referralCode) {
      return res.status(400).json({ 
        success: false,
        error: 'Wallet address and referral code are required' 
      });
    }
    
    // Normalize wallet address
    const normalizedAddress = walletAddress.toLowerCase().trim();
    
    // Find the referrer by referral code
    const referrer = await Referral.findOne({ referralCode });
    
    if (!referrer) {
      return res.status(404).json({ 
        success: false,
        error: 'Invalid referral code' 
      });
    }
    
    // Make sure user isn't referring themselves
    if (referrer.walletAddress === normalizedAddress) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot refer yourself' 
      });
    }
    
    // Check if this wallet is already in the referrer's list
    if (referrer.referredUsers.includes(normalizedAddress)) {
      return res.status(400).json({ 
        success: false,
        error: 'This wallet has already used this referral code' 
      });
    }
    
    // Add the user to the referrer's list
    referrer.referredUsers.push(normalizedAddress);
    await referrer.save();
    
    res.json({
      success: true,
      message: 'Referral successfully registered'
    });
    
  } catch (error) {
    console.error('Error registering referral:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to register referral',
      details: error.message 
    });
  }
});

// Get referral statistics for a wallet address
app.get('/api/referral/stats/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const normalizedAddress = walletAddress.toLowerCase().trim();
    
    const referral = await Referral.findOne({ walletAddress: normalizedAddress });
    
    if (!referral) {
      return res.status(404).json({ 
        success: false,
        error: 'No referral data found for this wallet address' 
      });
    }
    
    res.json({
      success: true,
      referralCode: referral.referralCode,
      totalReferrals: referral.referredUsers.length,
      referredUsers: referral.referredUsers
    });
    
  } catch (error) {
    console.error('Error retrieving referral stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve referral statistics',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong',
    details: err.message
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
