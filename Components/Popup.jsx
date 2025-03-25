import React, { useState, useEffect } from "react";
import { shortenAddress } from "../Utils/index";
import { ethers } from "ethers";
import styles from "./Popup.module.css";
import { useWeb3ModalProvider } from "@web3modal/ethers5/react";
import erc20 from "../context/ERC20.json";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";

const Popup = ({
  setBuyModel,
  BUY_TOKEN,
  currency,
  detail,
  account,
  TOKEN_ADDRESS,
  setLoader,
}) => {
  const [amount, setAmount] = useState("");
  const [transferToken, setTransferToken] = useState();
  const [referralCode, setReferralCode] = useState("");
  const { walletProvider } = useWeb3ModalProvider();
  const [promoCode, setPromoCode] = useState("");
  const [isReferralCodeFromURL, setIsReferralCodeFromURL] = useState(false);
  const [promoCodeInfo, setPromoCodeInfo] = useState(null);
  const { isConnected, address } = useWeb3ModalAccount();
  const [contractDetails, setContractDetails] = useState({
    tokenPrice: "0",
    minPurchase: "0",
    tokenBal: "0",
    tokenAddr: "",
    tokenSymbol: "",
  });

  const ERC20 = async (ADDRESS) => {
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const ERC20_ABI = erc20.abi;

      const network = await provider.getNetwork();
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(ADDRESS, ERC20_ABI, signer);

      const balance = await contract.balanceOf(address);

      const name = await contract.name();
      const symbol = await contract.symbol();
      const supply = await contract.totalSupply();
      const decimals = await contract.decimals();
      const contractAddress = await contract.address;

      const token = {
        address: contractAddress,
        name: name,
        symbol: symbol,
        decimals: decimals,
        supply: ethers.utils.formatEther(supply.toString()),
        balance: ethers.utils.formatEther(balance.toString()),
        chainId: network.chainId,
      };
      console.log(token);
      return token;
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  // Fetch all required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoader(true);

      try {
        // Fetch token data
        if (TOKEN_ADDRESS) {
          const tokenData = await ERC20(TOKEN_ADDRESS);
          setTransferToken(tokenData);
        }
        console.log("detail", detail);
        // Get contract details directly if possible
        if (detail?.contract) {
          console.log("here");
          const tokenDetails = await detail.contract.getTokenDetails();
          console.log("token details", tokenDetails);

          // Format values with ethers.js
          setContractDetails({
            tokenPrice: ethers.utils.formatEther(
              tokenDetails.tokenPrice || "0"
            ),
            minPurchase: ethers.utils.formatEther(
              tokenDetails.minPurchase || "0"
            ),
            tokenBal: ethers.utils.formatEther(tokenDetails.balance || "0"),
            tokenAddr: tokenDetails.tokenAddr,
            tokenSymbol: tokenDetails.symbol,
          });
        } else if (detail) {
          // Use details passed from context if contract isn't available
          setContractDetails({
            tokenPrice: detail.tokenPrice || "0",
            minPurchase: detail.minPurchase || "0",
            tokenBal: detail.tokenBal || "0",
            tokenAddr: detail.tokenAddr || "",
            tokenSymbol: detail.symbol || "",
          });
        }

        // Extract referral code from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get("ref");
        if (refCode) {
          setReferralCode(refCode);
          setIsReferralCodeFromURL(true);

          console.log("Referral code detected from URL:", refCode);
        }
      } catch (error) {
        console.error("Error fetching contract data:", error);
      } finally {
        setLoader(false);
      }
    };

    fetchData();
  }, [detail, TOKEN_ADDRESS]);

  const handleReferralCodeChange = (e) => {
    if (!isReferralCodeFromURL) {
      setReferralCode(e.target.value);
    }
  };

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
    // Reset promo code info when user starts typing new code
    setPromoCodeInfo(null);
  };

  const checkPromoCode = async () => {
    if (!promoCode) return;

    setLoader(true);
    try {
      // Assuming you have a contract method to check promo code
      const info = await detail?.contract.getPromoCodeInfo(promoCode);

      if (info && info.isValid) {
        setPromoCodeInfo({
          isValid: true,
          bonusPercentage: info.bonusPercentage.toNumber(),
          message: `${info.bonusPercentage.toNumber()}% bonus available!`,
        });
      } else {
        setPromoCodeInfo({
          isValid: false,
          message: "Invalid or expired promo code",
        });
      }
    } catch (error) {
      console.error("Error checking promo code:", error);
      setPromoCodeInfo({
        isValid: false,
        message: "Error checking promo code",
      });
    }
    setLoader(false);
  };

  const handleBuyToken = () => {
    // Pass both referral code and promo code to BUY_TOKEN function
    BUY_TOKEN(
      amount,
      promoCode,
      referralCode || "0x0000000000000000000000000000000000000000"
    );
  };

  // Calculate total amount including promo bonus if applicable
  const calculateTotalWithBonus = () => {
    if (!amount || !promoCodeInfo?.isValid) return amount;

    const bonus = (amount * promoCodeInfo.bonusPercentage) / 100;
    return (Number(amount) + bonus).toFixed(6);
  };

  // Calculate output value based on current token price
  const calculateOutputValue = () => {
    if (!amount || !contractDetails.tokenPrice) return "Output value";
    return `${(
      parseFloat(amount) * parseFloat(contractDetails.tokenPrice)
    ).toFixed(6)} ${currency}`;
  };

  // Format a placeholder value for the text area
  const formatPlaceholder = () => {
    return `Current Price: ${contractDetails.tokenPrice} ${currency}
    Minimum Purchase: ${contractDetails.minPurchase} ${currency}
    Token Balance: ${contractDetails.tokenBal}
    Token Address: ${shortenAddress(contractDetails.tokenAddr)}`;
  };

  return (
    <section
      className={`new-margin ico-contact pos-rel ${styles.popupContainer}`}
    >
      <div className="container">
        <div className="ico-contact__wrap">
          <h2 className="title">
            Buy Token <strong onClick={() => setBuyModel(false)}>X</strong>
          </h2>
          <div>
            <div className="row">
              <div className="col-lg-6">
                <input
                  type="text"
                  placeholder={`Token Balance: ${
                    transferToken?.balance || "0"
                  } ${transferToken?.symbol || ""} (Min: ${
                    contractDetails.minPurchase
                  } ${currency})`}
                  onChange={(e) => setAmount(e.target.value)}
                  value={amount}
                />
              </div>
              <div className="col-lg-6">
                <input type="text" value={calculateOutputValue()} readOnly />
              </div>

              <div className="col-lg-12">
                <textarea
                  disabled
                  name="message"
                  cols="30"
                  rows="10"
                  placeholder={formatPlaceholder()}
                ></textarea>
              </div>

              {/* Referral Code Input/Display */}
              <div className="col-lg-12">
                <div className="referral-input-container">
                  <input
                    type="text"
                    value={referralCode || ""}
                    onChange={handleReferralCodeChange}
                    placeholder="Referral Code (if any)"
                    disabled={isReferralCodeFromURL}
                    className={isReferralCodeFromURL ? "referral-from-url" : ""}
                  />
                  {isReferralCodeFromURL && (
                    <small className="referral-note">
                      Referral code detected from URL
                    </small>
                  )}
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="col-lg-12">
                <div
                  className={styles.promoCodeContainer}
                  style={{ margin: "15px 0" }}
                >
                  <div
                    className={styles.promoCodeInput}
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <input
                      type="text"
                      value={promoCode}
                      onChange={handlePromoCodeChange}
                      placeholder="Enter Promo Code"
                      style={{ flex: "1" }}
                    />
                    <button
                      onClick={checkPromoCode}
                      className={styles.checkPromoBtn}
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        height: "50px",
                        cursor: "pointer",
                      }}
                    >
                      Check
                    </button>
                  </div>
                  {promoCodeInfo && (
                    <div
                      className={`${styles.promoCodeMessage} ${
                        promoCodeInfo.isValid ? styles.valid : styles.invalid
                      }`}
                      style={{
                        marginTop: "8px",
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                    >
                      {promoCodeInfo.message}
                    </div>
                  )}
                  {promoCodeInfo?.isValid && (
                    <div
                      className={styles.bonusInfo}
                      style={{
                        marginTop: "8px",
                        color: "#28a745",
                        fontWeight: "bold",
                      }}
                    >
                      You will receive: {calculateTotalWithBonus()} tokens
                    </div>
                  )}
                </div>
              </div>

              <div className="ico-contract__btn text-center mt-10">
                <button onClick={handleBuyToken} className="thm-btn">
                  Buy Token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Popup;
