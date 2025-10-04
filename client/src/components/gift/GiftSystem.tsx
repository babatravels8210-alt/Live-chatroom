import React, { useState } from 'react';
import './GiftSystem.css';

interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GiftSystemProps {
  onSendGift: (gift: Gift, recipientId: string) => void;
  userCoins: number;
}

const GiftSystem: React.FC<GiftSystemProps> = ({ onSendGift, userCoins }) => {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [showGiftModal, setShowGiftModal] = useState(false);

  const gifts: Gift[] = [
    {
      id: '1',
      name: 'Heart',
      icon: '❤️',
      price: 10,
      category: 'Love',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Rose',
      icon: '🌹',
      price: 50,
      category: 'Romance',
      rarity: 'common'
    },
    {
      id: '3',
      name: 'Diamond',
      icon: '💎',
      price: 100,
      category: 'Luxury',
      rarity: 'rare'
    },
    {
      id: '4',
      name: 'Crown',
      icon: '👑',
      price: 500,
      category: 'Royal',
      rarity: 'epic'
    },
    {
      id: '5',
      name: 'Dragon',
      icon: '🐉',
      price: 1000,
      category: 'Mythical',
      rarity: 'legendary'
    },
    {
      id: '6',
      name: 'Star',
      icon: '⭐',
      price: 25,
      category: 'Celestial',
      rarity: 'common'
    },
    {
      id: '7',
      name: 'Fire',
      icon: '🔥',
      price: 75,
      category: 'Elements',
      rarity: 'rare'
    },
    {
      id: '8',
      name: 'Lightning',
      icon: '⚡',
      price: 200,
      category: 'Elements',
      rarity: 'epic'
    }
  ];

  const handleSendGift = () => {
    if (selectedGift && selectedRecipient) {
      if (userCoins >= selectedGift.price) {
        onSendGift(selectedGift, selectedRecipient);
        setShowGiftModal(false);
        setSelectedGift(null);
        setSelectedRecipient('');
      } else {
        alert('Not enough coins!');
      }
    }
  };

  return (
    <div className="gift-system">
      <button 
        className="gift-button"
        onClick={() => setShowGiftModal(true)}
      >
        🎁 Send Gift
      </button>

      {showGiftModal && (
        <div className="gift-modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="gift-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gift-modal-header">
              <h3>Send a Gift</h3>
              <button className="close-btn" onClick={() => setShowGiftModal(false)}>×</button>
            </div>
            
            <div className="gift-modal-content">
              <div className="user-coins">
                Your Coins: 💎 {userCoins}
              </div>
              
              <div className="gifts-grid">
                {gifts.map((gift) => (
                  <div 
                    key={gift.id}
                    className={`gift-item ${selectedGift?.id === gift.id ? 'selected' : ''} ${gift.rarity}`}
                    onClick={() => setSelectedGift(gift)}
                  >
                    <div className="gift-icon">{gift.icon}</div>
                    <div className="gift-name">{gift.name}</div>
                    <div className="gift-price">💎 {gift.price}</div>
                    <div className={`rarity-badge ${gift.rarity}`}>{gift.rarity}</div>
                  </div>
                ))}
              </div>
              
              <div className="gift-actions">
                <button 
                  className="send-gift-btn"
                  onClick={handleSendGift}
                  disabled={!selectedGift || !selectedRecipient}
                >
                  Send Gift 💎 {selectedGift?.price || 0}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftSystem;