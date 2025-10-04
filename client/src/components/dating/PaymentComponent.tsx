import React, { useState, useEffect } from 'react';
import { walletApi } from '../../services/api';

interface CoinPackage {
  coins: number;
  price: number;
  currency: string;
}

interface Gift {
  coins: number;
  name: string;
  animation: string;
}

const PaymentComponent: React.FC = () => {
  const [coinPackages, setCoinPackages] = useState<Record<string, CoinPackage>>({});
  const [gifts, setGifts] = useState<Record<string, Gift>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackagesAndBalance();
  }, []);

  const fetchPackagesAndBalance = async () => {
    try {
      const packagesResponse = await walletApi.getPackages();
      const balanceResponse = await walletApi.getBalance();
      
      setCoinPackages(packagesResponse.data.packages);
      setGifts(packagesResponse.data.gifts);
      setBalance(balanceResponse.data.balance);
    } catch (err) {
      setError('Failed to fetch packages and balance');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    try {
      setLoading(true);
      setSelectedPackage(packageId);
      
      // Create order with Cashfree
      const response = await walletApi.createOrder(packageId);
      
      setPaymentLink(response.data.paymentLink);
      setTransactionId(response.data.transactionId);
      
      // Redirect to Cashfree payment page
      if (response.data.paymentLink) {
        window.location.href = response.data.paymentLink;
      }
    } catch (err) {
      setError('Failed to create payment order');
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGiftSend = async (recipientId: string, giftType: string) => {
    try {
      setLoading(true);
      // Send gift to recipient
      const response = await walletApi.sendGift(recipientId, giftType);
      
      // Update balance
      setBalance(response.data.senderBalance);
      
      alert(`Gift sent successfully! You have ${response.data.senderBalance} coins remaining.`);
    } catch (err) {
      setError('Failed to send gift');
      console.error('Error sending gift:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading payment options...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Wallet & Payments</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Your Balance: {balance} coins</h2>
      </div>
      
      <div>
        <h2>Coin Packages</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {Object.entries(coinPackages).map(([key, pkg]) => (
            <div 
              key={key} 
              style={{ 
                border: '1px solid #ccc', 
                padding: '15px', 
                borderRadius: '5px', 
                width: '200px',
                textAlign: 'center'
              }}
            >
              <h3>{pkg.coins} Coins</h3>
              <p>Price: ₹{pkg.price}</p>
              <button 
                onClick={() => handlePurchase(key)}
                style={{ 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  padding: '10px 15px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer' 
                }}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Send Gifts</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {Object.entries(gifts).map(([key, gift]) => (
            <div 
              key={key} 
              style={{ 
                border: '1px solid #ccc', 
                padding: '15px', 
                borderRadius: '5px', 
                width: '150px',
                textAlign: 'center'
              }}
            >
              <h3>{gift.name}</h3>
              <p>Cost: {gift.coins} coins</p>
              <button 
                onClick={() => handleGiftSend('recipientId', key)}
                style={{ 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  padding: '8px 12px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer' 
                }}
              >
                Send Gift
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {paymentLink && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
          <h3>Payment Link Generated</h3>
          <p>Redirecting to payment page...</p>
          <a href={paymentLink} target="_blank" rel="noopener noreferrer">
            Click here if you're not redirected automatically
          </a>
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;