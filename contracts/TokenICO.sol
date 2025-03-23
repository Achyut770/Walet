// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenICO is ReentrancyGuard, Ownable {
    using SafeERC20 for ERC20;

    // Token information
    ERC20 public token;
    uint256 public tokenSalePrice;
    uint256 public soldTokens;
    uint256 public minimumPurchaseValue;
    uint8 public tokenDecimals;

    // Referral system constants
    uint256 public constant REFERRAL_REWARD_PERCENTAGE = 5; // Fixed 5% reward
    uint256 public currentBuyerCount;

    // Contract state
    bool public paused;

    // Referral structs
    struct ReferralStats {
        uint256 totalReferrals;
        uint256 totalRewards;
        uint256 totalVolume;
        bool isActiveReferrer;
    }

    // Promo code struct
    struct PromoCode {
        uint256 bonusPercentage;
        bool isActive;
    }

    // Mappings
    mapping(address => string) public userReferralCode;
    mapping(string => address) public referralCodeToAddress;
    mapping(address => address) public userToReferrer;
    mapping(address => ReferralStats) public referrerStats;
    mapping(address => bool) public blacklisted;

    // Promo code mappings
    mapping(string => PromoCode) public promoCodes;
    mapping(address => mapping(string => bool)) public userPromoCodeUsage;

    // Keep track of pending referrals (for users who clicked the link but haven't bought yet)
    mapping(address => string) public pendingReferrals;

    // Events
    event ReferralCodeGenerated(address indexed user, string referralCode);
    event ReferralRegistered(address indexed user, address indexed referrer);
    event ReferralRewarded(
        address indexed referrer,
        address indexed buyer,
        uint256 rewardAmount
    );
    event PurchaseProcessed(
        address indexed buyer,
        uint256 purchaseAmount,
        uint256 tokenAmount,
        uint256 bonusAmount
    );
    event UserBlacklisted(address indexed user, bool status);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event PromoCodeCreated(string code, uint256 bonusPercentage);
    event PromoCodeUsed(address indexed user, string code, uint256 bonusAmount);
    event PromoCodeDeactivated(string code);
    event TokenAddressUpdated(address indexed newTokenAddress);
    event TokenSalePriceUpdated(uint256 newPrice);
    event TokensWithdrawn(uint256 amount);
    event MinimumPurchaseAmountUpdated(uint256 newValue);
    event PendingReferralSet(address indexed user, string referralCode);
    event ETHTransferredToOwner(address indexed owner, uint256 amount);

    event rewardedAmount(uint256 _amount);
    event scalededAmount(uint256 _amount);

    constructor(
        address _tokenAddress,
        uint256 _tokenSalePrice,
        uint256 _minimumPurchaseValue
    ) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Zero token address");
        require(_tokenSalePrice > 0, "Invalid token price");
        require(_minimumPurchaseValue > 0, "Invalid min amount");

        token = ERC20(_tokenAddress);
        tokenSalePrice = _tokenSalePrice;
        minimumPurchaseValue = _minimumPurchaseValue;
        tokenDecimals = token.decimals();
        currentBuyerCount = 0;
        paused = false;
    }

    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    modifier notBlacklisted() {
        require(!blacklisted[msg.sender], "Address blacklisted");
        _;
    }

    // Admin functions
    function updateToken(address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Zero token address");
        token = ERC20(_tokenAddress);
        tokenDecimals = token.decimals();
        emit TokenAddressUpdated(_tokenAddress);
    }

    function updateTokenSalePrice(uint256 _tokenSalePrice) external onlyOwner {
        require(_tokenSalePrice > 0, "Invalid token price");
        tokenSalePrice = _tokenSalePrice;
        emit TokenSalePriceUpdated(_tokenSalePrice);
    }

    function setMinimumPurchaseValue(uint256 newValue) external onlyOwner {
        require(newValue > 0, "Invalid value");
        minimumPurchaseValue = newValue;
        emit MinimumPurchaseAmountUpdated(newValue);
    }

    function setBlacklist(address user, bool status) external onlyOwner {
        blacklisted[user] = status;
        emit UserBlacklisted(user, status);
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }

    // Referral system functions
    function generateReferralCode() external whenNotPaused notBlacklisted {
        require(bytes(userReferralCode[msg.sender]).length == 0, "Code exists");

        string memory referralCode = generateRandomCode();
        require(
            referralCodeToAddress[referralCode] == address(0),
            "Code collision"
        );

        userReferralCode[msg.sender] = referralCode;
        referralCodeToAddress[referralCode] = msg.sender;

        referrerStats[msg.sender].isActiveReferrer = true;

        emit ReferralCodeGenerated(msg.sender, referralCode);
    }

    // Function to store pending referral when a user clicks on a referral link
    function storePendingReferral(
        string calldata referralCode
    ) external whenNotPaused notBlacklisted {
        require(bytes(referralCode).length > 0, "Invalid referral code");
        require(
            referralCodeToAddress[referralCode] != address(0),
            "Referral code not found"
        );
        require(
            referralCodeToAddress[referralCode] != msg.sender,
            "Cannot refer yourself"
        );

        pendingReferrals[msg.sender] = referralCode;

        emit PendingReferralSet(msg.sender, referralCode);
    }

    function registerReferral(
        string calldata referralCode
    ) external whenNotPaused notBlacklisted {
        require(
            bytes(userReferralCode[msg.sender]).length == 0,
            "Already has code"
        );
        require(userToReferrer[msg.sender] == address(0), "Already referred");

        address referrer = referralCodeToAddress[referralCode];
        require(referrer != address(0), "Invalid code");
        require(referrer != msg.sender, "Self referral");
        require(
            referrerStats[referrer].isActiveReferrer,
            "Referrer not active"
        );

        userToReferrer[msg.sender] = referrer;
        referrerStats[referrer].totalReferrals++;

        emit ReferralRegistered(msg.sender, referrer);
    }

    // Promo code admin functions
    function setPromoCode(
        string calldata code,
        uint256 bonusPercentage
    ) external onlyOwner {
        require(bonusPercentage > 0, "Invalid bonus percentage");
        require(bytes(code).length > 0, "Invalid code");

        promoCodes[code] = PromoCode({
            bonusPercentage: bonusPercentage,
            isActive: true
        });

        emit PromoCodeCreated(code, bonusPercentage);
    }

    function deactivatePromoCode(string calldata code) external onlyOwner {
        require(promoCodes[code].isActive, "Code not active");
        promoCodes[code].isActive = false;
        emit PromoCodeDeactivated(code);
    }

    // Calculate the exact ETH amount required for a token purchase
    function calculateRequiredETH(
        uint256 tokenAmount
    ) public view returns (uint256) {
        return multiply(tokenAmount, tokenSalePrice);
    }

    // Token purchasing function with enhanced referral handling
    function buyToken(
        uint256 tokenAmount,
        string memory promoCode,
        address referrer
    ) external payable nonReentrant whenNotPaused notBlacklisted {
        require(tokenAmount > 0, "Token amount must be greater than zero");

        // Get a clearer error message for minimum purchase
        require(
            msg.value >= minimumPurchaseValue,
            string(
                abi.encodePacked(
                    "ETH amount is less than the minimum purchase value of ",
                    toString(minimumPurchaseValue),
                    " wei"
                )
            )
        );

        // Calculate the total amount of ETH required for the tokenAmount
        uint256 totalRequiredETH = calculateRequiredETH(tokenAmount);

        // Allow for a small buffer (1%) to account for potential calculation differences
        uint256 acceptableBuffer = totalRequiredETH / 100; // 1% buffer
        require(
            msg.value >= totalRequiredETH &&
                msg.value <= totalRequiredETH + acceptableBuffer,
            string(
                abi.encodePacked(
                    "Incorrect ETH amount: expected approximately ",
                    toString(totalRequiredETH),
                    " wei, received ",
                    toString(msg.value),
                    " wei"
                )
            )
        );

        // Consolidated token balance check
        uint256 scaledTokenAmount = tokenAmount * (10 ** tokenDecimals);

        // Check if contract has enough tokens for purchase and potential rewards
        require(
            scaledTokenAmount <= token.balanceOf(address(this)),
            "Insufficient token balance in contract"
        );

        uint256 tokenAmountInDecimals = tokenAmount * (10 ** tokenDecimals);

        uint256 bonusTokens = 0;
        if (bytes(promoCode).length > 0) {
            PromoCode storage promo = promoCodes[promoCode];
            require(promo.isActive, "Invalid or inactive promo code");
            require(
                !userPromoCodeUsage[msg.sender][promoCode],
                "Promo code already used"
            );

            bonusTokens = (tokenAmountInDecimals * promo.bonusPercentage) / 100;
            userPromoCodeUsage[msg.sender][promoCode] = true;

            emit PromoCodeUsed(msg.sender, promoCode, bonusTokens);
        }

        // Send tokens to buyer and update stats
        uint256 totalTokens = tokenAmountInDecimals + bonusTokens;
        token.safeTransfer(msg.sender, totalTokens);

        currentBuyerCount++;
        soldTokens += tokenAmount;

        // Process referral reward if applicable
        processReferralReward(referrer, tokenAmount);

        emit PurchaseProcessed(msg.sender, msg.value, tokenAmount, bonusTokens);

        // Transfer ETH to owner
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "ETH transfer failed");
        emit ETHTransferredToOwner(owner(), msg.value);
    }

    // New helper function to consolidate referral registration logic
    function processReferralRegistration(
        address user,
        string memory referralCode
    ) internal {
        // If user doesn't have a referrer yet
        if (userToReferrer[user] == address(0)) {
            address referrer = address(0);

            // First check direct referral code
            if (bytes(referralCode).length > 0) {
                referrer = referralCodeToAddress[referralCode];
            }
            // Then check pending referral
            else if (bytes(pendingReferrals[user]).length > 0) {
                referrer = referralCodeToAddress[pendingReferrals[user]];
            }

            // If we found a valid referrer, register it
            if (
                referrer != address(0) &&
                referrer != user &&
                referrerStats[referrer].isActiveReferrer
            ) {
                userToReferrer[user] = referrer;
                referrerStats[referrer].totalReferrals++;
                emit ReferralRegistered(user, referrer);
            }
        }
    }

    // Helper function for processing referral rewards
    function processReferralReward(
        address referrer,
        uint256 tokenAmount
    ) internal {
        if (referrer != address(0) && !blacklisted[referrer]) {
            uint256 scaledTokenAmount = tokenAmount * (10 ** tokenDecimals);
            uint256 rewardAmount = (scaledTokenAmount *
                REFERRAL_REWARD_PERCENTAGE *
                100) / 10000;
            emit rewardedAmount(rewardAmount);

            // Send rewards immediately - we already checked balance
            token.safeTransfer(referrer, rewardAmount);

            // Update referrer stats
            referrerStats[referrer].totalRewards += rewardAmount;
            referrerStats[referrer].totalVolume += tokenAmount;

            emit ReferralRewarded(referrer, msg.sender, rewardAmount);
        }
    }

    function getReferralStats(
        address referrer
    )
        external
        view
        returns (
            uint256 totalReferrals,
            uint256 totalRewards,
            uint256 totalVolume,
            bool isActive
        )
    {
        ReferralStats memory stats = referrerStats[referrer];
        return (
            stats.totalReferrals,
            stats.totalRewards,
            stats.totalVolume,
            stats.isActiveReferrer
        );
    }

    function getPromoCodeInfo(
        string calldata code
    ) external view returns (bool isValid, uint256 bonusPercentage) {
        PromoCode memory promo = promoCodes[code];
        return (promo.isActive, promo.bonusPercentage);
    }

    function getTokenDetails()
        public
        view
        returns (
            string memory name,
            string memory symbol,
            uint256 balance,
            uint256 supply,
            uint256 price,
            address tokenAddr,
            uint8 decimals,
            uint256 minPurchase
        )
    {
        return (
            token.name(),
            token.symbol(),
            token.balanceOf(address(this)),
            token.totalSupply(),
            tokenSalePrice,
            address(token),
            tokenDecimals,
            minimumPurchaseValue
        );
    }

    function getUserReferrerInfo(
        address user
    )
        external
        view
        returns (address referrer, string memory pendingReferralCode)
    {
        return (userToReferrer[user], pendingReferrals[user]);
    }

    // Withdrawal functions
    function emergencyWithdraw() external onlyOwner {
        require(paused, "Must pause first");

        uint256 tokenBalance = token.balanceOf(address(this));
        uint256 ethBalance = address(this).balance;

        if (tokenBalance > 0) {
            token.safeTransfer(owner(), tokenBalance);
            emit EmergencyWithdraw(address(token), tokenBalance);
        }

        if (ethBalance > 0) {
            (bool success, ) = payable(owner()).call{value: ethBalance}("");
            require(success, "ETH transfer failed");
            emit EmergencyWithdraw(address(0), ethBalance);
        }
    }

    function withdrawAllTokens() public onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        token.safeTransfer(owner(), balance);
        emit TokensWithdrawn(balance);
    }

    // Internal utility functions
    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "Multiplication overflow");
    }

    function generateRandomCode() internal view returns (string memory) {
        bytes32 randomHash = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                blockhash(block.number - 1)
            )
        );

        bytes memory alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        bytes memory code = new bytes(8);

        for (uint256 i = 0; i < 8; i++) {
            uint8 rand = uint8(randomHash[i]) % uint8(alphabet.length);
            code[i] = alphabet[rand];
        }

        return string(code);
    }

    // Helper function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }

    // Allow receiving ETH
    receive() external payable {}
}
