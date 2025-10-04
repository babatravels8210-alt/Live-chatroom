import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { datingApi } from '../../services/api';
import PaymentComponent from './PaymentComponent';

const DatingProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await datingApi.getProfile();
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dating Profile</h1>
      
      {profile ? (
        <div>
          <h2>{profile.fullName || 'No name set'}</h2>
          <p>Age: {profile.age || 'Not specified'}</p>
          <p>Gender: {profile.gender || 'Not specified'}</p>
          <p>Bio: {profile.bio || 'No bio yet'}</p>
          
          <button 
            onClick={() => setShowPayment(!showPayment)}
            style={{ 
              marginTop: '20px',
              backgroundColor: '#FF9800', 
              color: 'white', 
              padding: '10px 15px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            {showPayment ? 'Hide Payment Options' : 'Show Payment Options'}
          </button>
          
          {showPayment && <PaymentComponent />}
        </div>
      ) : (
        <div>
          <p>No profile found. Create your dating profile to get started!</p>
          
          <button 
            onClick={() => setShowPayment(!showPayment)}
            style={{ 
              marginTop: '20px',
              backgroundColor: '#FF9800', 
              color: 'white', 
              padding: '10px 15px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            {showPayment ? 'Hide Payment Options' : 'Show Payment Options'}
          </button>
          
          {showPayment && <PaymentComponent />}
        </div>
      )}
    </div>
  );
};

export default DatingProfile;