import React, { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

const MinimumPurchaseAmount = ({ 
  detail,
  currency,
  setOpenMinimumPurchase,
  UPDATE_MINIMUM_PURCHASE
}) => {
  const [minimumPurchase, setMinimumPurchase] = useState("");

  const handleMinimumPurchaseUpdate = async () => {
    try {
      if (!minimumPurchase || minimumPurchase <= 0) {
        return toast.error("Please enter a valid amount");
      }

      await UPDATE_MINIMUM_PURCHASE(minimumPurchase);
      setOpenMinimumPurchase(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="popup_overlay">
      <div className="popup">
        <div className="popup_heading">
          <h4>Minimum Purchase Amount</h4>
          <span onClick={() => setOpenMinimumPurchase(false)}>
            <FaTimes />
          </span>
        </div>

        <div className="popup_form">
          <p className="mb-10">
            Current minimum purchase: {detail?.minPurchase || "1"} Tokens
          </p>
          <div className="form_input">
            <input
              type="number"
              placeholder="Enter new minimum purchase amount"
              onChange={(e) => setMinimumPurchase(e.target.value)}
              min="1"
            />
          </div>

          <div className="popup_btn">
            <button
              className="btn btn--1"
              onClick={handleMinimumPurchaseUpdate}
            >
              Update Minimum Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimumPurchaseAmount;