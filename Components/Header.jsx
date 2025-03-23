"use client"

import React from "react"
import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers5/react"

const Header = ({
  account,
  CONNECT_WALLET,
  setIsSidebarOpen,
  setAccount,
  setLoader,
  setOwnerModel,
  shortenAddress,
  detail,
  currency,
  ownerModel,
}) => {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useWeb3ModalAccount()

  const handleAccountsChanged = (accounts) => {
    setAccount(accounts[0])
  }

  const connectMetamask = async () => {
    await open()
  }

  const toggleSidebar = (e) => {
    e.preventDefault();
    setIsSidebarOpen((prev) => !prev); // Toggle sidebar state
  };

  

  return (
    <header className="site-header header--transparent ico-header">
      <div className="header__main-wrap">
        <div className="container mxw_1640">
          <div className="header__main ul_li_between">
            <div className="header__left ul_li">
              <div className="header__logo">
                <a href="/">
                  <img
                    src="assets/img/shape/meta1.png"
                    alt=""
                    width="250"
                    height="120"
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      marginBottom: "-80px",
                    }}
                  />
                </a>
              </div>
            </div>

            <div className="main-menu__wrap ul_li navbar navbar-expand-xl">
              <nav className="main-menu collapse navbar-collapse">
                <ul>
                  <li className="active has-mega-menu">
                    <a href="/">Home</a>
                  </li>
                  <li>
                    <a className="scrollspy-btn" href="#about">
                      About
                    </a>
                  </li>
                  <li>
                    <a className="scrollspy-btn" href="#faq">
                      Faq
                    </a>
                  </li>
                  <li>
                    <a className="scrollspy-btn" href="#contact">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      className="scrollspy-btn"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        ownerModel ? setOwnerModel(false) : setOwnerModel(true)
                      }
                    >
                      Tools
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="header__action ul_li">
              <div className="d-xl-none">
              <a 
  className="header__bar hamburger_menu" 
  href="#"
  onClick={toggleSidebar} // Call toggle function
>
  <div className="header__bar-icon">
    <span />
    <span />
    <span />
    <span />
  </div>
</a>
              </div>

              {isConnected ? (
                <div className="header__account">
                  <a
                    onClick={() =>
                      navigator.clipboard.writeText(detail?.address)
                    }
                  >
                    {shortenAddress(detail?.address)}:{" "}
                    {detail?.maticBal?.slice(0, 6)}
                    {currency}
                  </a>
                </div>
              ) : (
                <div className="header__account">
                  <a onClick={() => connectMetamask()}>Connect Wallet</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
