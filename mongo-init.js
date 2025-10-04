// MongoDB initialization script
db = db.getSiblingDB('achat');

// Create collections with indexes
db.createCollection('users');
db.createCollection('rooms');
db.createCollection('messages');
db.createCollection('transactions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "isOnline": 1 });
db.users.createIndex({ "createdAt": 1 });

db.rooms.createIndex({ "name": 1 });
db.rooms.createIndex({ "category": 1 });
db.rooms.createIndex({ "isPrivate": 1 });
db.rooms.createIndex({ "createdAt": -1 });
db.rooms.createIndex({ "host": 1 });

db.messages.createIndex({ "room": 1, "createdAt": -1 });
db.messages.createIndex({ "sender": 1 });
db.messages.createIndex({ "recipient": 1 });
db.messages.createIndex({ "createdAt": -1 });

db.transactions.createIndex({ "user": 1, "createdAt": -1 });
db.transactions.createIndex({ "type": 1 });
db.transactions.createIndex({ "status": 1 });

// Insert default gifts
db.gifts = db.gifts || db.createCollection('gifts');
db.gifts.insertMany([
  {
    name: "Rose",
    price: 10,
    icon: "🌹",
    description: "A beautiful red rose",
    category: "flowers",
    createdAt: new Date()
  },
  {
    name: "Heart",
    price: 25,
    icon: "❤️",
    description: "Show your love",
    category: "emotions",
    createdAt: new Date()
  },
  {
    name: "Diamond",
    price: 100,
    icon: "💎",
    description: "Precious diamond gift",
    category: "luxury",
    createdAt: new Date()
  },
  {
    name: "Crown",
    price: 500,
    icon: "👑",
    description: "Royal crown for VIPs",
    category: "luxury",
    createdAt: new Date()
  },
  {
    name: "Cake",
    price: 50,
    icon: "🎂",
    description: "Celebration cake",
    category: "celebration",
    createdAt: new Date()
  },
  {
    name: "Fireworks",
    price: 200,
    icon: "🎆",
    description: "Amazing fireworks display",
    category: "celebration",
    createdAt: new Date()
  }
]);

print('Database initialized successfully!');
print('Collections created: users, rooms, messages, transactions, gifts');
print('Indexes created for optimal performance');
print('Default gifts inserted');