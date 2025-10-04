import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  type: 'text' | 'image' | 'voice' | 'gift';
  timestamp: string;
}

interface RoomData {
  _id: string;
  name: string;
  description: string;
  type: 'voice' | 'video' | 'text';
  host: {
    _id: string;
    username: string;
    avatar?: string;
  };
  currentParticipants: any[];
  maxParticipants: number;
  category: string;
  isPrivate: boolean;
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, sendRoomMessage } = useSocket();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      joinRoom(roomId);
    }

    return () => {
      if (roomId) {
        leaveRoom(roomId);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Socket event listeners
    const handleNewMessage = (event: any) => {
      const message = event.detail;
      if (message.room === roomId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleUserTyping = (event: any) => {
      const { userId, username } = event.detail;
      if (userId !== user?._id) {
        setTypingUsers(prev => [...prev.filter(u => u !== username), username]);
      }
    };

    const handleUserStoppedTyping = (event: any) => {
      const { username } = event.detail;
      setTypingUsers(prev => prev.filter(u => u !== username));
    };

    const handleWebRTCOffer = (event: any) => {
      handleReceiveOffer(event.detail);
    };

    const handleWebRTCAnswer = (event: any) => {
      handleReceiveAnswer(event.detail);
    };

    const handleWebRTCIceCandidate = (event: any) => {
      handleReceiveIceCandidate(event.detail);
    };

    window.addEventListener('newRoomMessage', handleNewMessage);
    window.addEventListener('userTyping', handleUserTyping);
    window.addEventListener('userStoppedTyping', handleUserStoppedTyping);
    window.addEventListener('webrtcOffer', handleWebRTCOffer);
    window.addEventListener('webrtcAnswer', handleWebRTCAnswer);
    window.addEventListener('webrtcIceCandidate', handleWebRTCIceCandidate);

    return () => {
      window.removeEventListener('newRoomMessage', handleNewMessage);
      window.removeEventListener('userTyping', handleUserTyping);
      window.removeEventListener('userStoppedTyping', handleUserStoppedTyping);
      window.removeEventListener('webrtcOffer', handleWebRTCOffer);
      window.removeEventListener('webrtcAnswer', handleWebRTCAnswer);
      window.removeEventListener('webrtcIceCandidate', handleWebRTCIceCandidate);
    };
  }, [roomId, user]);

  const fetchRoomData = async () => {
    try {
      const [roomResponse, messagesResponse] = await Promise.all([
        axios.get(`/api/rooms/${roomId}`),
        axios.get(`/api/rooms/${roomId}/messages`)
      ]);
      
      setRoom(roomResponse.data.room);
      setMessages(messagesResponse.data.messages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load room');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && roomId) {
      sendRoomMessage(roomId, newMessage.trim());
      setNewMessage('');
      handleStopTyping();
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && roomId) {
      setIsTyping(true);
      socket.emit('typing', { roomId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping && socket && roomId) {
      setIsTyping(false);
      socket.emit('stop_typing', { roomId });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: room?.type === 'video',
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc_ice_candidate', {
            roomId,
            candidate: event.candidate
          });
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (socket) {
        socket.emit('webrtc_offer', {
          roomId,
          offer
        });
      }

      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
      setError('Failed to start call. Please check your camera/microphone permissions.');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsCallActive(false);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleReceiveOffer = async (data: any) => {
    // Handle incoming WebRTC offer
    console.log('Received offer:', data);
  };

  const handleReceiveAnswer = async (data: any) => {
    // Handle incoming WebRTC answer
    console.log('Received answer:', data);
  };

  const handleReceiveIceCandidate = async (data: any) => {
    // Handle incoming ICE candidate
    console.log('Received ICE candidate:', data);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <button className="btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container">
        <div className="alert alert-error">Room not found</div>
        <button className="btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div style={{ marginBottom: '20px' }}>
          <button
            className="btn"
            style={{ width: '100%', marginBottom: '10px' }}
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          
          <h3 style={{ margin: '0 0 5px', fontSize: '18px' }}>{room.name}</h3>
          <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
            {room.description}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: '0', fontSize: '14px' }}>Participants</h4>
            <span className="badge">
              {room.currentParticipants.length}/{room.maxParticipants}
            </span>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {room.currentParticipants.map((participant: any) => (
              <div
                key={participant._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  borderRadius: '8px',
                  marginBottom: '5px',
                  background: participant._id === user?._id ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                }}
              >
                <img
                  src={participant.avatar || `https://ui-avatars.com/api/?name=${participant.username}&background=667eea&color=fff`}
                  alt={participant.username}
                  style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {participant.username}
                    {participant._id === room.host._id && ' 👑'}
                    {participant._id === user?._id && ' (You)'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {participant.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Controls */}
        {(room.type === 'voice' || room.type === 'video') && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Voice/Video</h4>
            
            {!isCallActive ? (
              <button
                className="btn btn-success"
                style={{ width: '100%' }}
                onClick={startCall}
              >
                {room.type === 'video' ? '📹 Start Video' : '🎤 Start Voice'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className={`btn ${isMuted ? 'btn-secondary' : ''}`}
                  style={{ width: '100%' }}
                  onClick={toggleMute}
                >
                  {isMuted ? '🔇 Unmute' : '🎤 Mute'}
                </button>
                
                {room.type === 'video' && (
                  <button
                    className={`btn ${isVideoOff ? 'btn-secondary' : ''}`}
                    style={{ width: '100%' }}
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? '📹 Turn On Video' : '📹 Turn Off Video'}
                  </button>
                )}
                
                <button
                  className="btn"
                  style={{ width: '100%', background: '#dc3545', color: 'white' }}
                  onClick={endCall}
                >
                  📞 End Call
                </button>
              </div>
            )}
          </div>
        )}

        {/* Video Elements */}
        {room.type === 'video' && isCallActive && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', marginBottom: '5px' }}>Your Video</div>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '8px',
                  background: '#000'
                }}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', marginBottom: '5px' }}>Remote Video</div>
              <video
                ref={remoteVideoRef}
                autoPlay
                style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '8px',
                  background: '#000'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Chat */}
      <div className="chat-main">
        <div className="chat-header">
          <div>
            <h2 style={{ margin: '0', fontSize: '20px' }}>{room.name}</h2>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              {room.currentParticipants.length} participants • {room.category}
            </p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.sender._id === user?._id ? 'own' : 'other'}`}
            >
              {message.sender._id !== user?._id && (
                <div className="message-sender">
                  {message.sender.username}
                </div>
              )}
              <div className="message-content">
                {message.type === 'gift' ? (
                  <span>🎁 Sent a gift</span>
                ) : (
                  message.content
                )}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          
          {typingUsers.length > 0 && (
            <div className="message other">
              <div className="message-content" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-success">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Room;