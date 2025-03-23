import React, { useState, useEffect } from 'react'; 
import { FaTimesCircle } from "react-icons/fa";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const PromoCodeManager = ({ setOpenPromoCode, setLoader, TOKEN_ICO_CONTRACT }) => {
  
  const [promoCode, setPromoCode] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("");
  const [deactivateCode, setDeactivateCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [contract, setContract] = useState(null);

  // Initialize contract when the component mounts
  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          setError("Please install MetaMask to interact with the contract.");
          return;
        }

        const contract = await TOKEN_ICO_CONTRACT();
        setContract(contract);
        console.log("Contract initialized successfully:", contract);

      } catch (error) {
        console.error("Error initializing contract:", error);
        setError("Failed to initialize contract: " + error.message);
      }
    };

    initializeContract();
  }, []); // Ensure this effect only runs once when the component mounts

  // Handle activating promo code
  const handleActivatePromoCode = async (e) => {
    e.preventDefault();

    // Check if contract is available
    if (!contract) {
      return setError("Contract is not available.");
    }

    if (!promoCode || !bonusPercentage) {
      return setError("Please fill all fields");
    }

    // Check if the bonus percentage is valid
    if (Number(bonusPercentage) < 0 || Number(bonusPercentage) > 100) {
      return setError("Bonus percentage must be between 0 and 100.");
    }

    try {
      setLoader(true);
      setError(""); // Clear any previous errors

      // Set expiry time (optional, set to 0 if no expiry)
      const expiryTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days expiry

      console.log(contract)
      const tx = await contract.setPromoCode(
        promoCode, 
        Number(bonusPercentage),        
        { gasLimit: 3000000 } // Specify a higher gas limit
      );

      await tx.wait();
      setMessage("Promo code activated successfully!");

      // Reset form
      setPromoCode("");
      setBonusPercentage("");

    } catch (error) {
      setError("Error activating promo code: " + error.message);
    } finally {
      setLoader(false);
    }
  };

  // Handle deactivating promo code
  const handleDeactivatePromoCode = async (e) => {
    e.preventDefault();

    // Check if contract is available
    if (!contract) {
      return setError("Contract is not available.");
    }

    if (!deactivateCode) {
      return setError("Please enter a promo code to deactivate");
    }

    try {
      setLoader(true);
      setError(""); // Clear any previous errors

      // Deactivate the promo code by calling setPromoCodeStatus with false
      const tx = await contract.deactivatePromoCode(deactivateCode); // false to deactivate
      await tx.wait();

      setMessage("Promo code deactivated successfully!");
      setDeactivateCode(""); // Clear the deactivate input

    } catch (error) {
      setError("Error deactivating promo code: " + error.message);
    } finally {
      setLoader(false);
    }
  };

  const styles = {
    promoCode: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 100,
    },
    promoCodeBox: {
      backgroundColor: '#1e1e1e',
      padding: '2rem',
      borderRadius: '1rem',
      width: '90%',
      maxWidth: '600px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    headerTitle: {
      fontSize: '1.5rem',
      color: '#fff',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: '#fff',
      cursor: 'pointer',
    },
    section: {
      marginBottom: '2rem',
      padding: '1rem',
      borderRadius: '0.5rem',
      backgroundColor: '#2d2d2d',
    },
    sectionTitle: {
      color: '#fff',
      marginBottom: '1rem',
      fontSize: '1.2rem',
    },
    inputGroup: {
      margin: '1rem 0',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#fff',
    },
    input: {
      width: '100%',
      padding: '0.8rem',
      borderRadius: '0.5rem',
      border: '1px solid #333',
      backgroundColor: '#2d2d2d',
      color: '#fff',
    },
    button: {
      width: '100%',
      marginTop: '1rem',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      color: '#fff',
    },
    activateButton: {
      backgroundColor: '#1a75ff',
    },
    deactivateButton: {
      backgroundColor: '#ff4d4d',
    },
    message: {
      textAlign: 'center',
      margin: '1rem 0',
      padding: '0.5rem',
      borderRadius: '0.3rem',
    },
    error: {
      backgroundColor: '#ff4d4d33',
      color: '#ff4d4d',
    },
    success: {
      backgroundColor: '#4CAF5033',
      color: '#4CAF50',
    }
  };

  return (
    <div style={styles.promoCode}>
      <div style={styles.promoCodeBox}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Promo Code Manager</h1>
          <button style={styles.closeButton} onClick={() => setOpenPromoCode(false)}>
            <FaTimesCircle />
          </button>
        </div>

        {(error || message) && (
          <div style={{
            ...styles.message,
            ...(error ? styles.error : styles.success)
          }}>
            {error || message}
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Activate New Promo Code</h2>
          <form onSubmit={handleActivatePromoCode}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Promo Code:</label>
              <input 
                style={styles.input}
                type="text" 
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Bonus Percentage:</label>
              <input 
                style={styles.input}
                type="number"
                placeholder="Enter bonus percentage"
                value={bonusPercentage}
                onChange={(e) => setBonusPercentage(e.target.value)}
                min="0"
                max="100"
              />
            </div>

            <button 
              type="submit" 
              style={{...styles.button, ...styles.activateButton}}
            >
              Activate Promo Code
            </button>
          </form>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Deactivate Promo Code</h2>
          <form onSubmit={handleDeactivatePromoCode}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Promo Code to Deactivate:</label>
              <input 
                style={styles.input}
                type="text" 
                placeholder="Enter promo code to deactivate"
                value={deactivateCode}
                onChange={(e) => setDeactivateCode(e.target.value.toUpperCase())}
              />
            </div>

            <button 
              type="submit" 
              style={{...styles.button, ...styles.deactivateButton}}
            >
              Deactivate Promo Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeManager;