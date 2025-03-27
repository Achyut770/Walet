import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useWeb3ModalAccount, useWeb3Modal } from "@web3modal/ethers5/react";
import erc20 from "../context/ERC20.json";
import tokenIco from "../context/TokenICO.json";
import { useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../context/constants";

const Hero = ({
  setBuyModel,
  account,
  CONNECT_WALLET,
  setAccount,
  setLoader,
  detail,
  addtokenToMetaMask,
  TOKEN_ADDRESS,
  getMinPurchaseAmount, // Add this as a prop
}) => {
  const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });
  const notifyError = (msg) => toast.error(msg, { duration: 2000 });
  const { address, isConnected, provider } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const { walletProvider } = useWeb3ModalProvider();
  const [balance, setBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState();

  const connectWallet = async () => {
    await open();
    setAccount(address);
    console.log(address); // Verify the account is set correctly
  };

  const ERC20 = async (ADDRESS) => {
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const ERC20_ABI = erc20.abi;

      const network = await provider.getNetwork();
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(ADDRESS, ERC20_ABI, signer);
      console.log("Signer ", signer, "Contract", contract);
      const balance = await contract.balanceOf(address);

      const name = await contract.name();
      const symbol = await contract.symbol();
      const supply = await contract.totalSupply();
      const decimals = await contract.decimals();
      const contractAddress = contract.address;

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
      console.log("Error", error);
    }
  };
  const [percentage, setPercentage] = useState();
  const [userReferralLink, setUserReferralLink] = useState(""); // State to hold the referral link
  const [userReferralCode, setUserReferralCode] = useState(""); // State to hold the unique referral code

  // Function to check if the user has an existing referral code from the backend
  const getReferralCode = async (walletAddress) => {
    try {
      const response = await axios.get(
        `https://metafrost.network/api/referral/${walletAddress}`
      );
      console.log(response.data); // Debugging line to check API response
      if (response.data && response.data.referralCode) {
        setUserReferralCode(response.data.referralCode);
        setUserReferralLink(
          `https://www.metafrost.network/referral/${response.data.referralCode}`
        );
      }
    } catch (error) {
      console.error("Error fetching referral code:", error);
      // Handle error (optional)
    }
  };

  // Function to generate a new referral code for a wallet address
  const createReferralCode = async (walletAddress) => {
    try {
      const response = await axios.post(
        "https://metafrost.network/api/referral",
        {
          walletAddress,
        }
      );
      console.log("API Response:", response); // Log the response
      if (response.data && response.data.referralCode) {
        setUserReferralCode(response.data.referralCode);
        setUserReferralLink(
          `https://metafrost.network/?ref=${response.data.referralCode}`
        );
        toast.success("Referral link generated successfully!"); // Notify the user that the link is generated
      } else {
        toast.error("Failed to generate referral code.");
      }
    } catch (error) {
      console.error("Error creating referral code:", error);
      toast.error("Error generating referral code.");
    }
  };

  useEffect(() => {
    if (account) {
      // When the user is logged in (i.e., they have an account from MetaMask)
      getReferralCode(account); // Fetch the referral code if it exists
    } else {
      setUserReferralLink("");
      setUserReferralCode("");
    }
  }, [account]);

  useEffect(() => {
    const calculatePercentage = () => {
      const tokenSold = detail?.soldTokens ?? 0;
      const tokenTotalSupply =
        detail?.soldTokens + Number(detail?.tokenBal) * 1 ?? 1;

      const percentageNew = (tokenSold / tokenTotalSupply) * 100;

      if (tokenTotalSupply === 0) {
        console.log("Token sale balance is zero, cannot calculate percentage");
      } else {
        setPercentage(percentageNew);
      }
    };
    const timer = setTimeout(calculatePercentage, 1000);

    return () => clearTimeout(timer);
  }, [detail]);

  const ADD_TOKEN_METAMASK = async () => {
    try {
      setLoader(true);

      try {
        const tokenDetails = await ERC20(TOKEN_ADDRESS);
        console.log("token details", tokenDetails);

        if (!tokenDetails) {
          return "Failed to fetch token details";
        }

        const tokenDecimals = tokenDetails?.decimals;
        const tokenAddress = TOKEN_ADDRESS;
        const tokenSymbol = tokenDetails?.symbol;
        const tokenImage = "https://i.ibb.co/93HXnHd1/mf1.png";
        alert(tokenAddress);

        const wasAdded = await walletProvider.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: tokenSymbol,
              decimals: tokenDecimals,
              image: tokenImage,
            },
          },
        });

        if (wasAdded) {
          alert("Token added successfully!");
        } else {
          alert("Token not added.");
        }
      } catch (error) {
        console.error("Failed to add token:", error);
        alert("Failed to add token.");
      }
    } catch (error) {
      setLoader(false);
      notifyError("Failed to add token to MetaMask");
      console.error("Error adding token to MetaMask:", error);
    } finally {
      setLoader(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard
      .writeText(userReferralLink)
      .then(() => {
        toast.success("Referral link copied!");
      })
      .catch((err) => {
        toast.error("Failed to copy referral link!");
      });
  };

  const [tokenPrice, setTokenPrice] = useState(0);
  const fetchBalance = async (ADDRESS) => {
    console.log("walletProvider", walletProvider, provider);
    if (!ethers || !walletProvider) return;
    const providers = new ethers.providers.Web3Provider(walletProvider);
    const ERC20_ABI = erc20.abi;

    const network = await providers.getNetwork();
    const signer = providers.getSigner();

    const contract = new ethers.Contract(ADDRESS, ERC20_ABI, signer);
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    const pricePromise = tokenContract.tokenSalePrice();

    const balancePromise = contract.balanceOf(address);
    const totalSupplyPromise = contract.totalSupply();
    const [price, balance, totalSuppy] = await Promise.all([
      pricePromise,
      balancePromise,
      totalSupplyPromise,
    ]);
    console.log("price", Number(price), Number(balance) / 10 ** 18);
    setTokenPrice(() => (Number(price) / 10 ** 18).toFixed(8));
    setTotalSupply(() => (Number(totalSupply) / 18).toFixed(2));
    setBalance(() => (Number(balance) / 10 ** 18).toFixed(2));
  };
  useEffect(() => {
    fetchBalance(TOKEN_ADDRESS);
  }, [ethers, walletProvider]);
  console.log("Balance", balance);
  console.log("price", tokenPrice);
  return (
    <section className="hero hero__ico pos-rel">
      <div className="hero__bg" data-background="assets/img/bg/hero_bg.png" />
      <div className="container">
        <div className="row">
          <div className="col-lg-7">
            <div className="hero__content">
              <h1 className="title mb-45">
                Participate in the <span>Ongoing Token</span> PRESALE
              </h1>
              <div className="btns">
                {isConnected ? (
                  <a className="thm-btn" onClick={() => setBuyModel(true)}>
                    PURCHASE TOKEN
                  </a>
                ) : (
                  <a className="thm-btn" onClick={() => connectWallet()}>
                    Connect Wallet
                  </a>
                )}
                {isConnected && (
                  <button
                    className="thm-btn thm-btn--dark balanceButton"
                    onClick={() => ADD_TOKEN_METAMASK()}
                  >
                    {/* <span>Token Balance</span>
                    <div className="button_balance_price">
                      <span>{balance} &nbsp;@MFT</span>
                      {balance && tokenPrice && (
                        <span className="in_usd" style={{ fontSize: "14px" }}>
                          {balance * tokenPrice}BNB
                        </span>
                      )}
                    </div> */}
                    Add To Metamask
                  </button>
                )}
              </div>
              <div className="hero__progress mt-50">
                <div className="progress-title ul_li_between">
                  <span>
                    <span>Raised -</span> {detail?.soldTokens} Tokens
                  </span>
                  <span>
                    <span>Total Presale -</span>{" "}
                    {detail?.soldTokens + Number(detail?.tokenBal)}{" "}
                    {detail?.symbol}
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
                <ul className="ul_li_between">
                  <li>Pre Sell</li>
                  <li>Soft Cap</li>
                  <li>Bonus</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="hero__explore-wrap text-center">
              <div className="hero__explore text-center">
                <div className="" />
                <span></span>
              </div>
              <div className="hero__countdown">
                <h6 className="text-center"></h6>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column justify-content-start gap-4  mt-5 align-items-start">
          <div
            className="d-flex align-items-center border rounded w-100"
            style={{ maxWidth: "400px", width: "95%" }}
          >
            <div className="px-3 py-2 text-white fw-bold border-end BgColorDark">
              TOTAL MFT
            </div>
            <div className="px-3 py-2 flex-grow-1">{balance}</div>
          </div>
          <div
            className="d-flex align-items-center border rounded w-100 "
            style={{ maxWidth: "400px", width: "95%" }}
          >
            <div className="px-3 py-2 text-white fw-bold border-end BgColorDark">
              MFT WORTH
            </div>
            <div className="px-3 py-2 flex-grow-1">
              {(tokenPrice * balance).toFixed(6)} BNB
            </div>
          </div>
        </div>

        {/* Referral Section */}
        <div className="row mt-5 mobile_bottom">
          <div className="col-lg-12">
            <div className="referral-info">
              <h4>Earn MetaFrost Tokens by Sharing Your Referral Link</h4>
              <p>
                Share your referral link and earn 5% of the tokens purchased by
                anyone who buys through your link.
              </p>
              <div className="input-group">
                <input
                  type="text"
                  className="referral-input"
                  value={userReferralLink} // Display the unique referral link here
                  readOnly
                />
              </div>
              <div className="btns">
                {/* Generate referral link button */}
                <button
                  className="thm-btn thm-btn--dark"
                  onClick={() => createReferralCode(address)}
                  disabled={!address}
                >
                  Generate Referral Link
                </button>
                {/* Copy referral link button */}
                <button
                  className="copy-btn"
                  onClick={copyReferralLink}
                  disabled={!userReferralLink}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hero__shape">
          <div className="shape shape--1">
            <img src="assets/img/shape/h_shape.png" alt="" />
          </div>
          <div className="shape shape--2">
            <img src="assets/img/shape/h_shape2.png" alt="" />
          </div>
          <div className="shape shape--3">
            <img src="assets/img/shape/h_shape3.png" alt="" />
          </div>
        </div>

        <div className="hero__coin">
          <div className="coin coin--1"></div>
          <div className="coin coin--2"></div>
          <div className="coin coin--3"></div>
          <div className="coin coin--4"></div>
          <div className="coin coin--5"></div>
          <div className="coin coin--6"></div>
        </div>
      </div>

      {/* CSS Styling directly inside JSX */}
      <style>
        {`

          .referral-info {
            text-align: left;
          }

          .referral-input {
            width: 100%;
            max-width: 400px;
            padding: 10px;
            margin-bottom: 10px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }

          .btns {
            display: flex; 
            gap: 10px; /* Space between buttons */
            margin-top: 10px; /* Add some space between the input and buttons */
          }

          .thm-btn, .copy-btn {
            padding: 10px 20px;
            height: 50px;
            border-radius: 5px;
            cursor: pointer;
          }

          .thm-btn {
            background-color: rgb(51, 28, 181);
            color: white;
            border: none;
          }

          .thm-btn:hover {
            background-color: rgb(51, 28, 181);
          }

          .copy-btn {
            background-color: #28a745;
            color: white;
            border: none;
          }

          .copy-btn:hover {
            background-color: #218838;
          }
          
          .thm-btn:disabled, .copy-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
            @media screen and (max-width: 700px) {
  .mobile_bottom {
    padding-bottom: 300px !important;
  }
}
        `}
      </style>
    </section>
  );
};

export default Hero;
