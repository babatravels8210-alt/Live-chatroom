# 🔧 Troubleshooting Guide - Live Chatroom

## Table of Contents
1. [Common Issues](#common-issues)
2. [Backend Issues](#backend-issues)
3. [Frontend Issues](#frontend-issues)
4. [Flutter Issues](#flutter-issues)
5. [Database Issues](#database-issues)
6. [Network Issues](#network-issues)
7. [Voice Chat Issues](#voice-chat-issues)
8. [Deployment Issues](#deployment-issues)

---

## Common Issues

### Application Won't Start

**Symptoms:**
- Server fails to start
- Error messages on startup
- Port already in use

**Solutions:**

1. **Check if port is already in use:**
   ```bash
   # Find process using port 12000
   lsof -i :12000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Check environment variables:**
   ```bash
   # Verify .env file exists
   ls -la .env
   
   # Check required variables
   cat .env | grep -E "DB_URI|JWT_SECRET|PORT"
   ```

3. **Check Node.js version:**
   ```bash
   node --version  # Should be 16.x or higher
   npm --version   # Should be 8.x or higher
   ```

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Backend Issues

### Database Connection Failed

**Error Message:**
```
MongooseError: Could not connect to MongoDB
```

**Solutions:**

1. **Check MongoDB is running:**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Start MongoDB if not running
   sudo systemctl start mongod
   ```

2. **Verify connection string:**
   ```bash
   # Check DB_URI in .env
   echo $DB_URI
   
   # Test connection
   mongo "mongodb://localhost:27017/livechatroom"
   ```

3. **Check network connectivity:**
   ```bash
   # For MongoDB Atlas
   ping cluster0.mongodb.net
   
   # Check firewall rules
   sudo ufw status
   ```

4. **Verify credentials:**
   - Check username and password
   - Ensure user has proper permissions
   - Whitelist IP address (for Atlas)

### JWT Token Errors

**Error Message:**
```
JsonWebTokenError: invalid token
```

**Solutions:**

1. **Check JWT_SECRET:**
   ```bash
   # Verify JWT_SECRET is set
   grep JWT_SECRET .env
   
   # Generate new secret if needed
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Clear old tokens:**
   ```javascript
   // Client-side
   localStorage.removeItem('token');
   
   // Force re-login
   window.location.href = '/login';
   ```

3. **Check token expiration:**
   ```javascript
   // Decode token to check expiry
   const jwt = require('jsonwebtoken');
   const decoded = jwt.decode(token);
   console.log('Expires:', new Date(decoded.exp * 1000));
   ```

### Socket.IO Connection Issues

**Error Message:**
```
WebSocket connection failed
```

**Solutions:**

1. **Check CORS configuration:**
   ```javascript
   // server.js
   const io = require('socket.io')(server, {
     cors: {
       origin: process.env.CLIENT_URL,
       methods: ['GET', 'POST'],
       credentials: true
     }
   });
   ```

2. **Verify client connection:**
   ```javascript
   // Client-side
   const socket = io('http://localhost:12000', {
     transports: ['websocket', 'polling'],
     reconnection: true,
     reconnectionDelay: 1000,
     reconnectionAttempts: 5
   });
   
   socket.on('connect_error', (error) => {
     console.error('Connection error:', error);
   });
   ```

3. **Check firewall rules:**
   ```bash
   # Allow WebSocket port
   sudo ufw allow 12000/tcp
   ```

### API Rate Limiting

**Error Message:**
```
429 Too Many Requests
```

**Solutions:**

1. **Check rate limit configuration:**
   ```javascript
   // Increase limits for development
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 1000 // Increase from 100
   });
   ```

2. **Clear rate limit cache:**
   ```bash
   # If using Redis
   redis-cli FLUSHDB
   ```

3. **Whitelist IP addresses:**
   ```javascript
   const limiter = rateLimit({
     skip: (req) => {
       return req.ip === '127.0.0.1'; // Skip localhost
     }
   });
   ```

---

## Frontend Issues

### Build Errors

**Error Message:**
```
Module not found: Can't resolve 'module-name'
```

**Solutions:**

1. **Clear cache and rebuild:**
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Check import paths:**
   ```typescript
   // Use correct relative paths
   import Component from './components/Component';
   
   // Not
   import Component from 'components/Component';
   ```

3. **Verify TypeScript configuration:**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": "src",
       "paths": {
         "@/*": ["*"]
       }
     }
   }
   ```

### CORS Errors

**Error Message:**
```
Access to fetch at 'http://localhost:12000/api' has been blocked by CORS policy
```

**Solutions:**

1. **Configure CORS on backend:**
   ```javascript
   // server.js
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

2. **Add proxy in development:**
   ```json
   // client/package.json
   {
     "proxy": "http://localhost:12000"
   }
   ```

3. **Use environment variables:**
   ```typescript
   // .env
   REACT_APP_API_URL=http://localhost:12000
   
   // Usage
   const API_URL = process.env.REACT_APP_API_URL;
   ```

### State Management Issues

**Symptoms:**
- State not updating
- Components not re-rendering
- Stale data

**Solutions:**

1. **Check React hooks dependencies:**
   ```typescript
   useEffect(() => {
     fetchData();
   }, [dependency]); // Add all dependencies
   ```

2. **Verify state updates:**
   ```typescript
   // Use functional updates
   setState(prevState => ({
     ...prevState,
     newValue: value
   }));
   ```

3. **Debug with React DevTools:**
   - Install React Developer Tools extension
   - Inspect component state and props
   - Check re-render causes

---

## Flutter Issues

### Build Failures

**Error Message:**
```
Gradle build failed
```

**Solutions:**

1. **Clean and rebuild:**
   ```bash
   flutter clean
   flutter pub get
   flutter build apk
   ```

2. **Update Gradle:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew build
   ```

3. **Check Android SDK:**
   ```bash
   flutter doctor -v
   
   # Accept licenses
   flutter doctor --android-licenses
   ```

### iOS Build Issues

**Error Message:**
```
CocoaPods not installed
```

**Solutions:**

1. **Install CocoaPods:**
   ```bash
   sudo gem install cocoapods
   pod setup
   ```

2. **Update pods:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Clean Xcode build:**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   flutter clean
   flutter build ios
   ```

### Hot Reload Not Working

**Solutions:**

1. **Restart Flutter:**
   ```bash
   # Press 'R' in terminal for hot reload
   # Press 'r' for hot restart
   ```

2. **Check for syntax errors:**
   ```bash
   flutter analyze
   ```

3. **Restart IDE:**
   - Close and reopen VS Code/Android Studio
   - Invalidate caches and restart

### Package Conflicts

**Error Message:**
```
Version solving failed
```

**Solutions:**

1. **Update dependencies:**
   ```bash
   flutter pub upgrade
   ```

2. **Check pubspec.yaml:**
   ```yaml
   dependencies:
     flutter:
       sdk: flutter
     # Use compatible versions
     http: ^0.13.0
     socket_io_client: ^2.0.0
   ```

3. **Clear pub cache:**
   ```bash
   flutter pub cache repair
   ```

---

## Database Issues

### Slow Queries

**Symptoms:**
- API responses taking too long
- Database CPU usage high
- Timeout errors

**Solutions:**

1. **Add indexes:**
   ```javascript
   // Add indexes for frequently queried fields
   db.users.createIndex({ username: 1 });
   db.rooms.createIndex({ category: 1, createdAt: -1 });
   db.messages.createIndex({ room: 1, createdAt: -1 });
   ```

2. **Enable query profiling:**
   ```javascript
   // MongoDB shell
   db.setProfilingLevel(2);
   
   // View slow queries
   db.system.profile.find().sort({ ts: -1 }).limit(5);
   ```

3. **Optimize queries:**
   ```javascript
   // Use projection to limit fields
   User.find({}, 'username email displayName');
   
   // Use lean() for read-only queries
   Room.find().lean();
   
   // Limit results
   Message.find().limit(50).sort({ createdAt: -1 });
   ```

### Connection Pool Exhausted

**Error Message:**
```
MongoError: connection pool exhausted
```

**Solutions:**

1. **Increase pool size:**
   ```javascript
   mongoose.connect(DB_URI, {
     maxPoolSize: 50,
     minPoolSize: 10
   });
   ```

2. **Close unused connections:**
   ```javascript
   // Properly close connections
   process.on('SIGINT', async () => {
     await mongoose.connection.close();
     process.exit(0);
   });
   ```

3. **Check for connection leaks:**
   ```javascript
   // Monitor connections
   console.log('Active connections:', mongoose.connection.readyState);
   ```

### Data Corruption

**Symptoms:**
- Invalid data in database
- Missing fields
- Incorrect data types

**Solutions:**

1. **Restore from backup:**
   ```bash
   # Restore MongoDB backup
   mongorestore --uri="mongodb://localhost:27017" /path/to/backup
   ```

2. **Run data migration:**
   ```javascript
   // Fix corrupted data
   db.users.updateMany(
     { coins: { $exists: false } },
     { $set: { coins: 0 } }
   );
   ```

3. **Add validation:**
   ```javascript
   const userSchema = new mongoose.Schema({
     coins: {
       type: Number,
       default: 0,
       min: 0,
       validate: {
         validator: Number.isInteger,
         message: 'Coins must be an integer'
       }
     }
   });
   ```

---

## Network Issues

### Timeout Errors

**Error Message:**
```
ETIMEDOUT: Connection timeout
```

**Solutions:**

1. **Increase timeout:**
   ```javascript
   // Axios
   axios.defaults.timeout = 30000; // 30 seconds
   
   // Fetch
   const controller = new AbortController();
   setTimeout(() => controller.abort(), 30000);
   fetch(url, { signal: controller.signal });
   ```

2. **Check network connectivity:**
   ```bash
   # Test connection
   ping api.example.com
   
   # Check DNS
   nslookup api.example.com
   
   # Test port
   telnet api.example.com 443
   ```

3. **Use retry logic:**
   ```javascript
   const retry = async (fn, retries = 3) => {
     try {
       return await fn();
     } catch (error) {
       if (retries > 0) {
         await new Promise(resolve => setTimeout(resolve, 1000));
         return retry(fn, retries - 1);
       }
       throw error;
     }
   };
   ```

### SSL/TLS Errors

**Error Message:**
```
UNABLE_TO_VERIFY_LEAF_SIGNATURE
```

**Solutions:**

1. **Update certificates:**
   ```bash
   # Renew Let's Encrypt certificate
   sudo certbot renew
   ```

2. **Check certificate validity:**
   ```bash
   openssl s_client -connect your-domain.com:443
   ```

3. **Disable SSL verification (development only):**
   ```javascript
   // Node.js
   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
   ```

---

## Voice Chat Issues

### Microphone Not Working

**Solutions:**

1. **Check browser permissions:**
   - Click lock icon in address bar
   - Allow microphone access
   - Reload page

2. **Test microphone:**
   ```javascript
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(stream => {
       console.log('Microphone access granted');
       stream.getTracks().forEach(track => track.stop());
     })
     .catch(error => {
       console.error('Microphone error:', error);
     });
   ```

3. **Check system settings:**
   - Verify microphone is not muted
   - Check default input device
   - Test in system settings

### Poor Audio Quality

**Solutions:**

1. **Check network bandwidth:**
   ```bash
   # Test internet speed
   speedtest-cli
   ```

2. **Adjust Agora settings:**
   ```javascript
   // Lower bitrate for poor connections
   client.setAudioProfile('music_standard');
   
   // Enable noise suppression
   client.setAudioProfile('speech_standard');
   ```

3. **Reduce participants:**
   - Limit speakers in room
   - Mute when not speaking
   - Use push-to-talk

### Echo or Feedback

**Solutions:**

1. **Use headphones:**
   - Prevents speaker output from being picked up by microphone

2. **Enable echo cancellation:**
   ```javascript
   const constraints = {
     audio: {
       echoCancellation: true,
       noiseSuppression: true,
       autoGainControl: true
     }
   };
   ```

3. **Adjust volume:**
   - Lower speaker volume
   - Adjust microphone sensitivity

---

## Deployment Issues

### Build Fails in Production

**Solutions:**

1. **Check environment variables:**
   ```bash
   # Verify all required variables are set
   heroku config
   
   # Set missing variables
   heroku config:set NODE_ENV=production
   ```

2. **Check build logs:**
   ```bash
   # Heroku
   heroku logs --tail
   
   # Docker
   docker logs container_name
   ```

3. **Test build locally:**
   ```bash
   NODE_ENV=production npm run build
   ```

### Memory Issues

**Error Message:**
```
JavaScript heap out of memory
```

**Solutions:**

1. **Increase Node.js memory:**
   ```bash
   # Set memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   
   # Or in package.json
   "scripts": {
     "start": "node --max-old-space-size=4096 server.js"
   }
   ```

2. **Optimize code:**
   - Remove memory leaks
   - Clear unused variables
   - Use streams for large data

3. **Scale horizontally:**
   - Add more server instances
   - Use load balancer

### SSL Certificate Issues

**Solutions:**

1. **Renew certificate:**
   ```bash
   sudo certbot renew --force-renewal
   ```

2. **Check certificate chain:**
   ```bash
   openssl s_client -connect your-domain.com:443 -showcerts
   ```

3. **Update Nginx configuration:**
   ```nginx
   ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
   ```

---

## Getting Help

### Before Asking for Help

1. **Check logs:**
   ```bash
   # Backend logs
   tail -f logs/error.log
   
   # PM2 logs
   pm2 logs
   
   # System logs
   journalctl -u mongod -f
   ```

2. **Search existing issues:**
   - GitHub Issues
   - Stack Overflow
   - Documentation

3. **Gather information:**
   - Error messages
   - Steps to reproduce
   - Environment details
   - Logs and screenshots

### Contact Support

- **GitHub Issues**: https://github.com/babatravels8210-alt/Live-chatroom/issues
- **Email**: support@example.com
- **Discord**: Join our community server

### Reporting Bugs

Include:
1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment details
6. Error logs
7. Screenshots (if applicable)

---

**Last Updated:** 2024-01-01