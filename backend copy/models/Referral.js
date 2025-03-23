const express = require('express');
const Referral = require('../models/Referral');
const User = require('../models/User');
const { 
  isValidAddress, 
  normalizeAddress, 
  referralContract // Contract instance
} = require('../contracts/referralContract');
const web3 = require('web3'); // Ensure web3 is correctly initialized
const router = express.Router();

// POST: Create a referral code for a wallet address
router.post('/referral', async (req, res) => {
  const { walletAddress } = req.body;

  // Check if wallet address is provided
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  // Check if the wallet address is valid
  if (!isValidAddress(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    // Normalize the address
    const normalizedAddress = normalizeAddress(walletAddress);
    
    // Check if the wallet already has a referral code
    const existingReferral = await Referral.findOne({ walletAddress: normalizedAddress });

    if (existingReferral) {
      return res.status(200).json({ referralCode: existingReferral.referralCode });
    }

    // Call the contract to generate a referral code
    try {
      const tx = await referralContract.methods.generateReferralCode().send({ from: normalizedAddress });
      console.log("Referral code generated successfully:", tx);
      
      // Get the referral code from events or direct call
      const referralCode = await referralContract.methods.userReferralCode(normalizedAddress).call();
      
      // Create a new Referral document
      const newReferral = new Referral({
        walletAddress: normalizedAddress,
        referralCode
      });

      // Save the new referral to the database
      await newReferral.save();

      // Return the generated referral code in the response
      res.status(201).json({ referralCode });
    } catch (contractError) {
      console.error("Contract error generating referral code:", contractError);
      res.status(500).json({ error: 'Failed to generate referral code on blockchain' });
    }
  } catch (error) {
    console.error("Error creating referral code:", error);
    res.status(500).json({ error: 'Failed to create referral code' });
  }
});

// POST: Register a referral
router.post('/referral/register', async (req, res) => {
  const { walletAddress, referralCode } = req.body;

  // Validate input
  if (!walletAddress || !referralCode) {
    return res.status(400).json({ success: false, error: 'Wallet address and referral code are required' });
  }

  try {
    // Validate the wallet address
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    // Normalize wallet address
    const normalizedAddress = normalizeAddress(walletAddress);

    // Find the referrer using the referral code
    const referrer = await Referral.findOne({ referralCode });

    if (!referrer) {
      return res.status(404).json({ success: false, error: 'Invalid referral code' });
    }

    // Normalize referrer's address
    const referrerAddress = normalizeAddress(referrer.walletAddress);
    console.log(`Referrer address: ${referrerAddress}`);

    // Check if the referred wallet address is the same as the referrer's address
    if (referrerAddress === normalizedAddress) {
      return res.status(400).json({ success: false, error: 'You cannot refer yourself' });
    }

    // Normalize all referred users addresses
    const normalizedReferredUsers = referrer.referredUsers?.map(addr => normalizeAddress(addr)) || [];

    // Check if the referred wallet has already used a referral code
    if (normalizedReferredUsers.includes(normalizedAddress)) {
      return res.status(400).json({ success: false, error: 'This wallet has already used a referral code' });
    }

    // Call the smart contract to register the referral
    try {
      const tx = await referralContract.methods.registerReferral(referralCode).send({ from: normalizedAddress });
      console.log("Referral registered successfully:", tx);
      
      // Add the referred user to the referrer's referred users list in our database
      referrer.referredUsers = referrer.referredUsers || [];
      referrer.referredUsers.push(normalizedAddress);
      await referrer.save();

      // Verify the userToReferrer mapping
      const registeredReferrer = await referralContract.methods.userToReferrer(normalizedAddress).call();
      console.log(`User ${normalizedAddress} is referred by ${registeredReferrer}`);

      res.json({
        success: true,
        message: 'Referral registered successfully',
        referrer: referrerAddress
      });
    } catch (contractError) {
      console.error('Error registering referral on contract:', contractError);
      res.status(500).json({
        success: false, 
        error: `Failed to register referral on blockchain: ${contractError.message}`
      });
    }
  } catch (error) {
    console.error('Error registering referral:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while registering referral',
    });
  }
});

// POST: Process purchase and apply referral rewards
router.post('/purchase', async (req, res) => {
  const { walletAddress, purchaseAmount, promoCode } = req.body;
  
  // Validate input
  if (!walletAddress || !purchaseAmount) {
    return res.status(400).json({ success: false, error: 'Wallet address and purchase amount are required' });
  }
  
  try {
    // Validate the wallet address
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    
    // Normalize wallet address
    const normalizedAddress = normalizeAddress(walletAddress);
    
    // Call the smart contract to process the purchase
    try {
      // Convert purchaseAmount to contract format
      const formattedAmount = web3.utils.toWei(purchaseAmount.toString(), 'ether');
      
      // Use empty string if no promo code provided
      const codeToUse = promoCode || "";
      
      // This single call handles everything: the purchase, bonus calculation,
      // and referral reward distribution
      const tx = await referralContract.methods.processPurchase(formattedAmount, codeToUse)
        .send({ from: normalizedAddress });
      
      console.log("Purchase processed successfully:", tx);

      // Extract event data from transaction receipt
      const purchaseEvent = tx.events.PurchaseProcessed;
      const referralEvent = tx.events.ReferralRewarded;
      
      // Update user's purchase history in database if needed
      const user = await User.findOne({ walletAddress: normalizedAddress });
      if (user) {
        // Update user data as needed
        await user.save();
      } else {
        // Create new user record if needed
        const newUser = new User({ walletAddress: normalizedAddress });
        await newUser.save();
      }

      res.json({
        success: true,
        message: 'Purchase processed successfully',
        purchase: {
          amount: purchaseAmount,
          bonusAmount: purchaseEvent ? web3.utils.fromWei(purchaseEvent.returnValues.bonusAmount) : '0'
        },
        referralReward: referralEvent ? {
          referrer: referralEvent.returnValues.referrer,
          rewardAmount: web3.utils.fromWei(referralEvent.returnValues.rewardAmount)
        } : null
      });
    } catch (contractError) {
      console.error('Error processing purchase on contract:', contractError);
      res.status(500).json({
        success: false, 
        error: `Failed to process purchase: ${contractError.message}`
      });
    }
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while processing purchase',
    });
  }
});

// GET: Get referral stats for a wallet
router.get('/stats/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;
  
  if (!isValidAddress(walletAddress)) {
    return res.status(400).json({ success: false, error: 'Invalid wallet address' });
  }
  
  try {
    const normalizedAddress = normalizeAddress(walletAddress);
    
    // Get referral stats from the smart contract
    const stats = await referralContract.methods.getReferralStats(normalizedAddress).call();
    
    // Get the user's referral code if any
    const referralCode = await referralContract.methods.userReferralCode(normalizedAddress).call();
    
    res.json({
      success: true,
      walletAddress: normalizedAddress,
      referralCode: referralCode || null,
      stats: {
        totalReferrals: stats[0],
        totalRewards: web3.utils.fromWei(stats[1]),
        totalVolume: web3.utils.fromWei(stats[2]),
        lastRewardTime: stats[3] > 0 ? new Date(stats[3] * 1000).toISOString() : null,
        isActive: stats[4]
      }
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch referral stats' });
  }
});

// GET: Get promo code information
router.get('/promo/:code', async (req, res) => {
  const { code } = req.params;
  
  try {
    const promoInfo = await referralContract.methods.getPromoCodeInfo(code).call();
    
    res.json({
      success: true,
      promoCode: code,
      isValid: promoInfo[0],
      bonusPercentage: promoInfo[1],
      remainingUses: promoInfo[2],
      expiryTime: promoInfo[3] > 0 ? new Date(promoInfo[3] * 1000).toISOString() : null,
      minPurchaseAmount: web3.utils.fromWei(promoInfo[4])
    });
  } catch (error) {
    console.error("Error fetching promo code info:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch promo code information' });
  }
});

module.exports = router;