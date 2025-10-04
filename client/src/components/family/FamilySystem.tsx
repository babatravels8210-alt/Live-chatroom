import React, { useState, useEffect } from 'react';
import './FamilySystem.css';

interface Family {
  id: string;
  name: string;
  badge: string;
  level: number;
  members: number;
  maxMembers: number;
  leader: string;
  description: string;
  isPublic: boolean;
}

interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'elder' | 'member';
  contribution: number;
  joinedDate: string;
}

const FamilySystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<'browse' | 'myFamily' | 'create'>('browse');
  const [families, setFamilies] = useState<Family[]>([]);
  const [myFamily, setMyFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = () => {
    // Mock data
    const mockFamilies: Family[] = [
      {
        id: '1',
        name: 'Royal Kings',
        badge: '👑',
        level: 25,
        members: 45,
        maxMembers: 50,
        leader: 'KingJohn',
        description: 'Elite family for top players',
        isPublic: true
      },
      {
        id: '2',
        name: 'Dragon Warriors',
        badge: '🐉',
        level: 20,
        members: 38,
        maxMembers: 50,
        leader: 'DragonMaster',
        description: 'Strong and united warriors',
        isPublic: true
      },
      {
        id: '3',
        name: 'Star Legends',
        badge: '⭐',
        level: 18,
        members: 42,
        maxMembers: 50,
        leader: 'StarQueen',
        description: 'Shine bright like stars',
        isPublic: true
      },
      {
        id: '4',
        name: 'Phoenix Rising',
        badge: '🔥',
        level: 22,
        members: 40,
        maxMembers: 50,
        leader: 'PhoenixLord',
        description: 'Rise from the ashes',
        isPublic: false
      }
    ];
    setFamilies(mockFamilies);
  };

  const joinFamily = (familyId: string) => {
    const family = families.find(f => f.id === familyId);
    if (family) {
      setMyFamily(family);
      setCurrentView('myFamily');
      
      // Mock members
      setFamilyMembers([
        {
          id: '1',
          name: family.leader,
          avatar: '/avatars/leader.png',
          role: 'leader',
          contribution: 5000,
          joinedDate: '2024-01-01'
        },
        {
          id: '2',
          name: 'You',
          avatar: '/avatars/you.png',
          role: 'member',
          contribution: 0,
          joinedDate: new Date().toISOString().split('T')[0]
        }
      ]);
    }
  };

  const leaveFamily = () => {
    setMyFamily(null);
    setFamilyMembers([]);
    setCurrentView('browse');
  };

  const createFamily = (familyData: any) => {
    const newFamily: Family = {
      id: Date.now().toString(),
      name: familyData.name,
      badge: familyData.badge,
      level: 1,
      members: 1,
      maxMembers: 50,
      leader: 'You',
      description: familyData.description,
      isPublic: familyData.isPublic
    };
    
    setFamilies([...families, newFamily]);
    setMyFamily(newFamily);
    setCurrentView('myFamily');
  };

  return (
    <div className="family-system">
      <div className="family-header">
        <h2>👨‍👩‍👧‍👦 Family System</h2>
        <div className="family-nav">
          <button 
            className={currentView === 'browse' ? 'active' : ''}
            onClick={() => setCurrentView('browse')}
          >
            Browse Families
          </button>
          {myFamily && (
            <button 
              className={currentView === 'myFamily' ? 'active' : ''}
              onClick={() => setCurrentView('myFamily')}
            >
              My Family
            </button>
          )}
          {!myFamily && (
            <button 
              className={currentView === 'create' ? 'active' : ''}
              onClick={() => setCurrentView('create')}
            >
              Create Family
            </button>
          )}
        </div>
      </div>

      {currentView === 'browse' && (
        <div className="families-browse">
          <div className="families-grid">
            {families.map((family) => (
              <div key={family.id} className="family-card">
                <div className="family-badge">{family.badge}</div>
                <h3>{family.name}</h3>
                <div className="family-level">Level {family.level}</div>
                <p className="family-description">{family.description}</p>
                <div className="family-stats">
                  <span>👥 {family.members}/{family.maxMembers}</span>
                  <span>👑 {family.leader}</span>
                </div>
                <div className="family-status">
                  {family.isPublic ? '🌐 Public' : '🔒 Private'}
                </div>
                <button 
                  className="join-family-btn"
                  onClick={() => joinFamily(family.id)}
                >
                  Join Family
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'myFamily' && myFamily && (
        <div className="my-family">
          <div className="family-banner">
            <div className="family-badge-large">{myFamily.badge}</div>
            <div className="family-info">
              <h2>{myFamily.name}</h2>
              <p>Level {myFamily.level}</p>
              <p>{myFamily.description}</p>
            </div>
            <button className="leave-family-btn" onClick={leaveFamily}>
              Leave Family
            </button>
          </div>

          <div className="family-stats-detailed">
            <div className="stat-box">
              <span className="stat-value">{myFamily.members}</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{myFamily.level}</span>
              <span className="stat-label">Level</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">0</span>
              <span className="stat-label">Rank</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">0</span>
              <span className="stat-label">Points</span>
            </div>
          </div>

          <div className="family-members">
            <h3>Family Members</h3>
            <div className="members-list">
              {familyMembers.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <img src={member.avatar} alt={member.name} />
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <span className="member-role">{member.role}</span>
                  </div>
                  <div className="member-stats">
                    <span>💎 {member.contribution}</span>
                    <span>📅 {member.joinedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="family-activities">
            <h3>Family Activities</h3>
            <div className="activities-list">
              <div className="activity-item">
                <span className="activity-icon">🎉</span>
                <span className="activity-text">Family created!</span>
                <span className="activity-time">Just now</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'create' && !myFamily && (
        <div className="create-family">
          <h3>Create Your Family</h3>
          <form className="family-form" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createFamily({
              name: formData.get('name'),
              badge: formData.get('badge'),
              description: formData.get('description'),
              isPublic: formData.get('isPublic') === 'public'
            });
          }}>
            <div className="form-group">
              <label>Family Name</label>
              <input type="text" name="name" required maxLength={20} />
            </div>
            
            <div className="form-group">
              <label>Family Badge (Emoji)</label>
              <input type="text" name="badge" required maxLength={2} placeholder="👑" />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" required maxLength={100} rows={3} />
            </div>
            
            <div className="form-group">
              <label>Privacy</label>
              <select name="isPublic">
                <option value="public">Public - Anyone can join</option>
                <option value="private">Private - Invitation only</option>
              </select>
            </div>
            
            <button type="submit" className="create-btn">
              Create Family (Cost: 1000 💎)
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FamilySystem;