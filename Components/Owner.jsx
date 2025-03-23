import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers5/react";

const Owner = ({ 
  setOwnerModel,
  currency,
  detail, 
  account, 
  setTransferModel,
  setTransferCurrency,
  setOpenDonate,
  TOKEN_WITHDRAW,
  setOpenUpdatePrice,
  setOpenUpdateAddress,
  setOpenPromoCode,
  setOpenMinimumPurchase // Add new state setter
}) => {
    const {address,isConnected}=useWeb3ModalAccount()
  
  return (
    <section className="team pos-rel">
      <div className="container">
        <div className="new-owner team__wrap ul_li">
          <div className="team__item">
            <div className="avatar">
              <img src="assets/img/token/art.png" alt="" />
            </div>

            <div className="team__info text-center mb-20">
              <h3>TOKEN TRANSFER</h3>
              <span>ANY ERC20</span>
            </div>

            <div className="team__social ul_li_center">
              <span 
              onClick={() => (setOwnerModel (false), setTransferModel(true))}     
              className="h-icon"
                 style={{
                  cursor: "pointer",
                 }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>
          <div className="team__item">
            <div className="avatar">
              <img src="assets/img/token/art.png" alt="" />
            </div>

            <div className="team__info text-center mb-20">
              <h3>TRANSFER FUND</h3>
              <span>
                {detail?.maticBal.slice(0, 6)} {currency}
                </span>
            </div>

            <div className="team__social ul_li_center">
              <span 
              onClick={() => (
                setOwnerModel (false), setTransferCurrency(true)
              )}     
              className="h-icon"
                 style={{
                  cursor: "pointer",
                 }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>
          <div className="team__item">
            <div className="avatar">
              <img src="assets/img/shape/donate.png" alt="" />
            </div>

            <div className="team__info text-center mb-20">
              <h3>Donate FUND</h3>
              <span>Your Support Matters</span>
            </div>

            <div className="team__social ul_li_center">
              <span 
              onClick={() => (setOwnerModel (false), setOpenDonate(true))}     
              className="h-icon"
                 style={{
                  cursor: "pointer",
                 }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>

          {address.toLowerCase() == detail?.owner && (
           <>
            <div className="team__item">
               <div className="avatar">
                 <img src="assets/img/token/art.png" alt="" />
             </div>

            <div className="team__info text-center mb-20">
              <h3>WITHDRAW</h3>
              <span>ICO TOKEN Only Owner</span>
            </div>

            <div className="team__social ul_li_center">
              <span 
              onClick={() => TOKEN_WITHDRAW()}     
              className="h-icon"
                 style={{
                  cursor: "pointer",
                 }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>

          <div className="team__item">
               <div className="avatar">
                 <img src="assets/img/token/art.png" alt="" />
             </div>

            <div className="team__info text-center mb-20">
              <h3>UPDATE TOKEN</h3>
              <span>ICO TOKEN Only Owner</span>
            </div>

            <div className="team__social ul_li_center">
              <span 
               onClick={() => (
                setOwnerModel (false), setOpenUpdateAddress(true)
              )}  
              className="h-icon"
                 style={{
                  cursor: "pointer",
                 }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>

          <div className="team__item">
               <div className="avatar">
                 <img src="assets/img/token/art.png" alt="" />
             </div>

            <div className="team__info text-center mb-20">
              <h3>UPDATE TOKEN PRICE</h3>
              <span>ICO TOKEN Only Owner</span>
            </div>

            <div className="team__social ul_li_center">
              <span 
               onClick={() => (
                setOwnerModel (false), setOpenUpdatePrice(true)
              )}  
              className="h-icon"
                 style={{
                  cursor: "pointer",
                 }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>

          {/* Added new Minimum Purchase section */}
          <div className="team__item">
            <div className="avatar">
              <img src="assets/img/token/art.png" alt="" />
            </div>

            <div className="team__info text-center mb-20">
              <h3>MINIMUM PURCHASE</h3>
              <span>Set Minimum Amount</span>
            </div>

            <div className="team__social ul_li_center">
              <span 
                onClick={() => {
                  setOwnerModel(false);
                  setOpenMinimumPurchase(true);
                }}  
                className="h-icon"
                style={{
                  cursor: "pointer",
                }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>

          {/* Promo Code Manager section */}
          <div className="team__item">
            <div className="avatar">
              <img src="assets/img/token/art.png" alt="" />
            </div>

            <div className="team__info text-center mb-20">
              <h3>PROMO CODE</h3>
              <span>Manage Promo Codes</span>
            </div>

            <div className="team__social ul_li_center">
              <span 
                onClick={() => {
                  setOwnerModel(false);
                  setOpenPromoCode(true);
                }}  
                className="h-icon"
                style={{
                  cursor: "pointer",
                }}  
              >
                <FaPlus />
              </span>
            </div>
          </div>
          </>
          )}

        </div>
      </div>

      <div className="team_shape">
        <div className="shape shape--1">
          <img src="assets/img/shape/t_shape1.png" alt="" />
        </div>
        <div className="shape shape--2">
          <img src="assets/img/shape/t_shape2.png" alt="" />
        </div>    
      </div>
    </section>
  );
};

export default Owner;