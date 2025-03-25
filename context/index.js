import React, { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import {
  CHECK_WALLET_CONNECTED,
  CONNECT_WALLET,
  GET_BALANCE,
  CHECK_ACCOUNT_BALANCE,
  TOKEN_ICO_CONTRACT,
  ERC20,
  ERC20_CONTRACT,
  TOKEN_ADDRESS,
  addtokenToMetaMask,
} from "./constants";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers5/react";
import tokenICO from "./TokenICO.json";
import { CONTRACT_ADDRESS } from "./constants";

export const TOKEN_ICO_Context = React.createContext();

export const TOKEN_ICO_Provider = ({ children }) => {
  const { isConnected, address } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const Dapp_NAME = "TOKEN PRESALE DAPP";
  const currency = "tBNB";
  const network = "BscTestnet";

  const [loader, setLoader] = useState(false);
  const [account, setAccount] = useState();
  const [count, setCount] = useState(0);
  const [contractInstance, setContractInstance] = useState(null);

  const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });
  const notifyError = (msg) => toast.error(msg, { duration: 2000 });
  const fetchContract = (address, abi, singer) =>
    new ethers.Contract(address, abi, singer);

  //--- CONTRACT FUNCTION ---
  const TOKEN_ICO = async () => {
    try {
      if (isConnected) {
        setLoader(true);
        setAccount(address);

        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = provider.getSigner();
        const CONTRACT_ADDRESSS = CONTRACT_ADDRESS;
        const CONTRACT_ABI = tokenICO.abi;

        const contract = fetchContract(CONTRACT_ADDRESSS, CONTRACT_ABI, signer);

        // Try to get token details
        let tokenDetails;
        try {
          console.log("contract", contract);
          tokenDetails = await contract.getTokenDetails();
          console.log("Token details:", tokenDetails); // Log the data for debugging
          console.log(
            "MinPurchase in provider:",
            tokenDetails.minPurchase?.toString()
          );
        } catch (err) {
          console.error("Error getting token details:", err);
          tokenDetails = {}; // Fallback to empty object
        }

        // Get other contract data
        let contractOwner, soldTokens, ethBal;
        try {
          contractOwner = await contract.owner();
        } catch (err) {
          console.error("Error getting owner:", err);
          contractOwner = address; // Fallback to current address
        }

        try {
          soldTokens = await contract.soldTokens();
        } catch (err) {
          console.error("Error getting sold tokens:", err);
          soldTokens = { toNumber: () => 0 }; // Fallback with dummy method
        }

        try {
          let maticBal = await signer.getBalance();

          maticBal = ethers.utils.formatEther(maticBal.toString());
          ethBal = maticBal;
        } catch (err) {
          console.error("Error getting ETH balance:", err);
          ethBal = "0"; // Fallback to zero
        }

        // Create token object with safe data access
        const token = {
          tokenBal:
            tokenDetails && tokenDetails.balance
              ? ethers.utils.formatEther(tokenDetails.balance.toString())
              : "0",
          name: tokenDetails ? tokenDetails.name || "Unknown" : "Unknown",
          symbol: tokenDetails ? tokenDetails.symbol || "???" : "???",
          supply:
            tokenDetails && tokenDetails.supply
              ? ethers.utils.formatEther(tokenDetails.supply.toString())
              : "0",
          tokenPrice:
            tokenDetails && tokenDetails.price
              ? ethers.utils.formatEther(tokenDetails.price.toString())
              : "0",
          minPurchase:
            tokenDetails && tokenDetails.minPurchase
              ? ethers.utils.formatEther(tokenDetails.minPurchase.toString())
              : "0",
          tokenAddr: tokenDetails ? tokenDetails.tokenAddr || address : address,
          maticBal: ethBal || "0",
          address: address.toLowerCase(),
          owner: contractOwner
            ? contractOwner.toLowerCase()
            : address.toLowerCase(),
          soldTokens: soldTokens ? soldTokens.toNumber() : 0,
        };

        setLoader(false);
        return token;
      }
    } catch (error) {
      console.log("Main TOKEN_ICO error:", error);
      notifyError("error try again later");
      setLoader(false);
      // Return a minimal valid object to prevent further errors
      return {
        tokenBal: "0",
        name: "Unknown",
        symbol: "???",
        supply: "0",
        tokenPrice: "0",
        tokenAddr: "",
        minPurchase: "0",
        maticBal: "0",
        address: "",
        owner: "",
        soldTokens: 0,
      };
    }
  };

  // New function to manage promo codes

  // Check referrer status
  const CHECK_REFERRER_STATUS = async (referrerAddress) => {
    try {
      setLoader(true);
      const contract = await TOKEN_ICO_CONTRACT();

      // Check if referrer is inactive
      const referralStats = await contract.getReferralStats(referrerAddress);
      const isActive = referralStats[3]; // The 4th return value is isActive (boolean)
      console.log("Is referrer active?", isActive);

      // Check if referrer is blacklisted
      const isBlacklisted = await contract.blacklisted(referrerAddress);
      console.log("Is referrer blacklisted?", isBlacklisted);

      // Check if the referral code is properly registered
      const referralCode = await contract.referralCodeToAddress(
        referrerAddress
      );
      console.log("Referral code for this referrer:", referralCode);

      setLoader(false);

      return { isActive, isBlacklisted, referralCode };
    } catch (error) {
      console.log("Error checking referrer status:", error);
      setLoader(false);
      notifyError("Error checking referrer status. Please try again later.");
      return { isActive: false, isBlacklisted: false, referralCode: "" };
    }
  };

  const BUY_TOKEN = async (amount, referralCode = "", promoCode = "") => {
    try {
      console.log("Starting BUY_TOKEN function");
      console.log("Amount", amount, referralCode, promoCode);
      setLoader(true);

      console.log("Checking wallet connection");

      console.log("Wallet connected:", address);
      alert(address);

      if (address) {
        console.log("Getting contract instance");
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = provider.getSigner();
        const CONTRACT_ADDRESSS = CONTRACT_ADDRESS;
        const CONTRACT_ABI = tokenICO.abi;
        console.log("Contract instance obtained");
        const contract = fetchContract(CONTRACT_ADDRESSS, CONTRACT_ABI, signer);

        console.log("Getting token details");
        const tokenDetails = await contract.getTokenDetails();
        console.log("Token details:", tokenDetails);

        // Get the minimum purchase value
        const minPurchase = tokenDetails.minPurchase
          ? ethers.utils.formatEther(tokenDetails.minPurchase.toString())
          : "0";
        console.log("Minimum purchase required:", minPurchase, "ETH");

        // Use the contract's built-in calculation function
        console.log("Calculating required ETH using contract function");
        const totalPriceWei = await contract.calculateRequiredETH(
          Number(amount)
        );
        console.log(
          "Required ETH from contract:",
          ethers.utils.formatEther(totalPriceWei),
          "ETH"
        );

        // Check if totalPrice is less than minPurchase
        const totalPriceEther = ethers.utils.formatEther(totalPriceWei);
        if (parseFloat(totalPriceEther) < parseFloat(minPurchase)) {
          console.log("Amount below minimum purchase");
          setLoader(false);
          return notifyError(
            `ETH amount (${totalPriceEther}) is less than the minimum purchase value (${minPurchase})`
          );
        }

        console.log("Preparing to call contract.buyToken");
        console.log(
          "Parameters:",
          Number(amount),
          referralCode,
          promoCode,
          totalPriceWei.toString()
        );

        // This is where the MetaMask popup should appear
        const transaction = await contract.buyToken(
          Number(amount),
          referralCode,
          promoCode,
          {
            value: totalPriceWei.toString(),
            gasLimit: ethers.utils.hexlify(3000000),
          }
        );

        console.log("Transaction initiated:", transaction);
        console.log("Waiting for transaction to complete");
        const receipt = await transaction.wait();
        console.log("Transaction receipt:", receipt);

        console.log("Transaction completed, checking user referrer info");
        const referrerInfo = await contract.getUserReferrerInfo(address);
        console.log("User referrer info:", referrerInfo);
        setLoader(false);
        notifySuccess("Transaction completed successfully.");
        window.location.reload();
      }
    } catch (error) {
      alert(error);
      console.log("Error in BUY_TOKEN:", error);

      // Check if the error message contains a specific reason
      if (error.message) {
        // Extract the error message from the contract revert
        const errorMessage = error.message;
        if (errorMessage.includes("Incorrect ETH amount")) {
          notifyError(
            "Transaction failed: Incorrect ETH amount. Please try again."
          );
        } else if (
          errorMessage.includes(
            "ETH amount is less than the minimum purchase value"
          )
        ) {
          notifyError(
            "Transaction failed: ETH amount is less than the minimum purchase value."
          );
        } else if (errorMessage.includes("Insufficient token balance")) {
          notifyError(
            "Transaction failed: Insufficient token balance in the contract."
          );
        } else {
          notifyError("Error occurred: " + errorMessage.substring(0, 100));
        }
      } else {
        notifyError("Error occurred. Please try again later.");
      }

      setLoader(false);
    }
  };

  // Add the new UPDATE_MINIMUM_PURCHASE function
  const UPDATE_MINIMUM_PURCHASE = async (minimumAmount) => {
    try {
      setLoader(true);

      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();

        const transaction = await contract.updateMinimumPurchaseAmount(
          Number(minimumAmount)
        );

        await transaction.wait();
        setLoader(false);
        notifySuccess("Minimum purchase amount updated successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      notifyError("Error updating minimum purchase amount");
      setLoader(false);
    }
  };

  const TOKEN_WITHDRAW = async () => {
    try {
      setLoader(true);

      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();

        const tokenDetails = await contract.getTokenDetails();

        const availableToken = ethers.utils.formatEther(
          tokenDetails.balance.toString()
        );

        if (availableToken > 1) {
          const transaction = await contract.withdrawAllTokens();

          await transaction.wait();
          setLoader(false);
          notifySuccess("Transaction completed successfully");
          window.location.reload();
        }
      }
    } catch (error) {
      console.log(error);
      notifyError("error try again later");
      setLoader(false);
    }
  };

  const UPDATE_TOKEN = async (_address) => {
    try {
      setLoader(true);

      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();

        const transaction = await contract.updateToken(_address);

        await transaction.wait();
        setLoader(false);
        notifySuccess("Transaction completed successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      notifyError("error try again later");
      setLoader(false);
    }
  };

  const UPDATE_TOKEN_PRICE = async (price) => {
    try {
      setLoader(true);

      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const payAmount = ethers.utils.parseUnits(price.toString(), "ether");

        const transaction = await contract.updateTokenSalePrice(payAmount);

        await transaction.wait();
        setLoader(false);
        notifySuccess("Transaction completed successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      notifyError("error try again later");
      setLoader(false);
    }
  };

  const DONATE = async (AMOUNT) => {
    try {
      setLoader(true);

      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const payAmount = ethers.utils.parseUnits(AMOUNT.toString(), "ether");

        const transaction = await contract.transferToOwner(payAmount, {
          value: payAmount.toString(),

          gasLimit: ethers.utils.hexlify(100000),
        });

        await transaction.wait();
        setLoader(false);
        notifySuccess("Transaction completed successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      notifyError("error try again later");
      setLoader(false);
    }
  };

  const TRANSFER_ETHER = async (transfer) => {
    try {
      setLoader(true);

      const { _receiver, _amount } = transfer;

      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const payAmount = ethers.utils.parseUnits(_amount.toString(), "ether");

        const transaction = await contract.transferEther(_receiver, payAmount, {
          value: payAmount.toString(),

          gasLimit: ethers.utils.hexlify(100000),
        });

        await transaction.wait();
        setLoader(false);
        notifySuccess("Transaction completed successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      notifyError("error try again later");
      setLoader(false);
    }
  };

  const TRANSFER_TOKEN = async (transfer) => {
    try {
      setLoader(true);

      const { _tokenAddress, _sendTo, _amount } = transfer;

      if (address) {
        const contract = await ERC20_CONTRACT(_tokenAddress);
        const payAmount = ethers.utils.parseUnits(_amount.toString(), "ether");

        const transaction = await contract.transfer(_sendTo, payAmount, {
          gasLimit: ethers.utils.hexlify(100000),
        });

        await transaction.wait();
        setLoader(false);
        notifySuccess("Transaction completed successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      notifyError("error try again later");
      setLoader(false);
    }
  };

  const MANAGE_PROMO_CODE = async (action, codeData) => {
    try {
      setLoader(true);

      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();

        if (action === "activate") {
          const { code, percentage, usageLimit = 1, expiryDays = 7 } = codeData;

          const expiryTime =
            Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

          const tx = await contract.setPromoCode(
            code,
            Number(percentage),
            usageLimit,
            expiryTime,
            0, // minimum purchase amount
            { gasLimit: 500000 }
          );

          await tx.wait();
          notifySuccess("Promo code activated successfully");
        } else if (action === "deactivate") {
          const { code } = codeData;

          const tx = await contract.setPromoCodeStatus(code, false);
          await tx.wait();
          notifySuccess("Promo code deactivated successfully");
        }

        setLoader(false);
        return true;
      }
    } catch (error) {
      console.log("Error managing promo code:", error);
      notifyError("Error: " + error.message);
      setLoader(false);
      return false;
    }
  };

  return (
    <TOKEN_ICO_Context.Provider
      value={{
        TOKEN_ICO,
        BUY_TOKEN,
        CHECK_REFERRER_STATUS,
        CONNECT_WALLET,
        ERC20,
        CHECK_ACCOUNT_BALANCE,
        setAccount,
        setLoader,
        addtokenToMetaMask,
        TOKEN_ADDRESS,
        TRANSFER_TOKEN,
        TOKEN_ICO_CONTRACT, // Added TOKEN_ICO_CONTRACT explicitly
        MANAGE_PROMO_CODE, // Added new promo code management function
        UPDATE_MINIMUM_PURCHASE,
        TOKEN_WITHDRAW,
        UPDATE_TOKEN,
        UPDATE_TOKEN_PRICE,
        DONATE,
        TRANSFER_ETHER,
        loader,
        address,
        currency,
      }}
    >
      {children}
    </TOKEN_ICO_Context.Provider>
  );
};
