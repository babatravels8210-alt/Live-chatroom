# 🧪 Testing Guide - Live Chatroom

## Table of Contents
1. [Overview](#overview)
2. [Backend Testing](#backend-testing)
3. [Flutter Testing](#flutter-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Test Coverage](#test-coverage)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)

---

## Overview

This guide covers comprehensive testing strategies for the Live Chatroom application, including unit tests, integration tests, widget tests, and end-to-end tests.

### Testing Stack
- **Backend**: Jest / Mocha + Chai + Supertest
- **Flutter**: flutter_test package
- **E2E**: Selenium / Appium
- **Coverage**: Istanbul (backend), lcov (Flutter)

---

## Backend Testing

### Setup

1. **Install Testing Dependencies**
   ```bash
   npm install --save-dev jest supertest mongodb-memory-server
   ```

2. **Configure Jest**
   
   Create `jest.config.js`:
   ```javascript
   module.exports = {
     testEnvironment: 'node',
     coverageDirectory: 'coverage',
     collectCoverageFrom: [
       'routes/**/*.js',
       'models/**/*.js',
       'middleware/**/*.js',
       'socket/**/*.js',
       '!**/node_modules/**',
     ],
     testMatch: [
       '**/tests/**/*.test.js',
     ],
     setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
   };
   ```

3. **Create Test Setup File**
   
   Create `tests/setup.js`:
   ```javascript
   const mongoose = require('mongoose');
   const { MongoMemoryServer } = require('mongodb-memory-server');

   let mongoServer;

   beforeAll(async () => {
     mongoServer = await MongoMemoryServer.create();
     const mongoUri = mongoServer.getUri();
     await mongoose.connect(mongoUri);
   });

   afterAll(async () => {
     await mongoose.disconnect();
     await mongoServer.stop();
   });

   afterEach(async () => {
     const collections = mongoose.connection.collections;
     for (const key in collections) {
       await collections[key].deleteMany();
     }
   });
   ```

### Running Backend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/backend/unit/user.test.js

# Run tests matching pattern
npm test -- --testNamePattern="User"
```

### Unit Tests

Unit tests focus on testing individual functions and modules in isolation.

**Example: User Model Test**
```javascript
describe('User Model', () => {
  test('should hash password before saving', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    
    await user.save();
    expect(user.password).not.toBe('password123');
  });
});
```

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

**Example: Authentication API Test**
```javascript
describe('POST /api/auth/register', () => {
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### Socket.IO Tests

**Example: Socket Connection Test**
```javascript
const io = require('socket.io-client');

describe('Socket.IO Tests', () => {
  let clientSocket;

  beforeEach((done) => {
    clientSocket = io('http://localhost:12000');
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    clientSocket.close();
  });

  test('should connect to server', (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });

  test('should join room', (done) => {
    clientSocket.emit('join-room', { roomId: 'test-room' });
    
    clientSocket.on('room-joined', (data) => {
      expect(data.roomId).toBe('test-room');
      done();
    });
  });
});
```

---

## Flutter Testing

### Setup

1. **Dependencies are already in `pubspec.yaml`**
   ```yaml
   dev_dependencies:
     flutter_test:
       sdk: flutter
     flutter_lints: ^5.0.0
     mockito: ^5.4.0
     integration_test:
       sdk: flutter
   ```

2. **Run Flutter Tests**
   ```bash
   # Run all tests
   flutter test

   # Run tests with coverage
   flutter test --coverage

   # Run specific test file
   flutter test test/widget_test.dart

   # Run tests in watch mode
   flutter test --watch
   ```

### Widget Tests

Widget tests verify that UI components render correctly and respond to user interactions.

**Example: Button Test**
```dart
testWidgets('Button should be tappable', (WidgetTester tester) async {
  bool tapped = false;
  
  await tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: ElevatedButton(
          onPressed: () => tapped = true,
          child: Text('Tap Me'),
        ),
      ),
    ),
  );

  await tester.tap(find.text('Tap Me'));
  await tester.pump();

  expect(tapped, true);
});
```

### Unit Tests (Dart)

**Example: Model Test**
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:global_voice_chat/models/chat_room.dart';

void main() {
  group('ChatRoom Model', () {
    test('should create ChatRoom from JSON', () {
      final json = {
        'id': '123',
        'name': 'Test Room',
        'participants': 5,
      };

      final room = ChatRoom.fromJson(json);

      expect(room.id, '123');
      expect(room.name, 'Test Room');
      expect(room.participants, 5);
    });

    test('should convert ChatRoom to JSON', () {
      final room = ChatRoom(
        id: '123',
        name: 'Test Room',
        participants: 5,
      );

      final json = room.toJson();

      expect(json['id'], '123');
      expect(json['name'], 'Test Room');
      expect(json['participants'], 5);
    });
  });
}
```

### Integration Tests (Flutter)

Create `integration_test/app_test.dart`:
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:global_voice_chat/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('App Integration Tests', () {
    testWidgets('Complete user flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate to room list
      expect(find.text('Voice Chat Rooms'), findsOneWidget);

      // Tap create room button
      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      // Fill in room details
      await tester.enterText(
        find.byKey(Key('room_name_field')),
        'Test Room',
      );
      await tester.pumpAndSettle();

      // Submit form
      await tester.tap(find.text('Create'));
      await tester.pumpAndSettle();

      // Verify room was created
      expect(find.text('Test Room'), findsOneWidget);
    });
  });
}
```

Run integration tests:
```bash
flutter test integration_test/app_test.dart
```

---

## End-to-End Testing

### Setup Selenium (Web)

1. **Install Dependencies**
   ```bash
   npm install --save-dev selenium-webdriver chromedriver
   ```

2. **Create E2E Test**
   
   Create `tests/e2e/user-flow.test.js`:
   ```javascript
   const { Builder, By, until } = require('selenium-webdriver');
   const chrome = require('selenium-webdriver/chrome');

   describe('User Flow E2E Tests', () => {
     let driver;

     beforeAll(async () => {
       const options = new chrome.Options();
       options.addArguments('--headless');
       
       driver = await new Builder()
         .forBrowser('chrome')
         .setChromeOptions(options)
         .build();
     });

     afterAll(async () => {
       await driver.quit();
     });

     test('should complete registration flow', async () => {
       await driver.get('http://localhost:12000');
       
       // Click register button
       await driver.findElement(By.id('register-btn')).click();
       
       // Fill in form
       await driver.findElement(By.id('username')).sendKeys('testuser');
       await driver.findElement(By.id('email')).sendKeys('test@example.com');
       await driver.findElement(By.id('password')).sendKeys('password123');
       
       // Submit form
       await driver.findElement(By.id('submit-btn')).click();
       
       // Wait for redirect
       await driver.wait(until.urlContains('/dashboard'), 5000);
       
       // Verify success
       const title = await driver.getTitle();
       expect(title).toContain('Dashboard');
     });
   });
   ```

### Setup Appium (Mobile)

1. **Install Appium**
   ```bash
   npm install -g appium
   npm install --save-dev webdriverio @wdio/cli
   ```

2. **Configure WebdriverIO**
   
   Create `wdio.conf.js`:
   ```javascript
   exports.config = {
     runner: 'local',
     specs: ['./tests/mobile/**/*.test.js'],
     capabilities: [{
       platformName: 'Android',
       'appium:deviceName': 'Android Emulator',
       'appium:app': './build/app/outputs/flutter-apk/app-release.apk',
       'appium:automationName': 'UiAutomator2',
     }],
     logLevel: 'info',
     framework: 'mocha',
     mochaOpts: {
       timeout: 60000,
     },
   };
   ```

3. **Create Mobile E2E Test**
   ```javascript
   describe('Mobile App E2E', () => {
     it('should launch app', async () => {
       const appTitle = await $('~app-title').getText();
       expect(appTitle).toBe('Live Chatroom');
     });

     it('should navigate to room list', async () => {
       await $('~rooms-tab').click();
       await expect($('~room-list')).toBeDisplayed();
     });
   });
   ```

---

## Test Coverage

### Generate Coverage Reports

**Backend Coverage**
```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

**Flutter Coverage**
```bash
# Generate coverage
flutter test --coverage

# Convert to HTML
genhtml coverage/lcov.info -o coverage/html

# View report
open coverage/html/index.html
```

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **Critical Paths**: 100% coverage
- **Overall**: 75%+ coverage

### Coverage Configuration

Create `.coveragerc`:
```ini
[run]
omit =
    */tests/*
    */node_modules/*
    */coverage/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
```

---

## CI/CD Integration

### GitHub Actions

The CI/CD pipeline (`.github/workflows/ci-cd.yml`) automatically runs tests on every push and pull request.

**Test Jobs:**
1. Backend unit tests
2. Backend integration tests
3. Flutter widget tests
4. Flutter integration tests
5. Code coverage reporting

### Local Pre-commit Hooks

Create `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run backend tests
npm test

# Run Flutter tests
flutter test

# Check coverage
npm run coverage:check
```

Install husky:
```bash
npm install --save-dev husky
npx husky install
```

---

## Best Practices

### 1. Test Organization

```
tests/
├── backend/
│   ├── unit/
│   │   ├── user.test.js
│   │   ├── room.test.js
│   │   └── message.test.js
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── rooms.test.js
│   │   └── socket.test.js
│   └── e2e/
│       └── user-flow.test.js
├── flutter/
│   ├── unit/
│   ├── widget/
│   └── integration/
└── setup.js
```

### 2. Test Naming Convention

```javascript
// Good
describe('User Authentication', () => {
  test('should register user with valid credentials', () => {});
  test('should fail registration with invalid email', () => {});
});

// Bad
describe('Tests', () => {
  test('test1', () => {});
  test('test2', () => {});
});
```

### 3. AAA Pattern

```javascript
test('should create user', async () => {
  // Arrange
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  // Act
  const user = await User.create(userData);

  // Assert
  expect(user.username).toBe(userData.username);
  expect(user.email).toBe(userData.email);
});
```

### 4. Mock External Dependencies

```javascript
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

test('should send welcome email', async () => {
  const emailService = require('../services/emailService');
  
  await registerUser(userData);
  
  expect(emailService.sendEmail).toHaveBeenCalledWith(
    userData.email,
    'Welcome'
  );
});
```

### 5. Test Data Factories

```javascript
// testHelpers.js
const createTestUser = (overrides = {}) => ({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  ...overrides,
});

// Usage
const user = await User.create(createTestUser({ 
  email: 'custom@example.com' 
}));
```

### 6. Async Testing

```javascript
// Good
test('should fetch user', async () => {
  const user = await fetchUser('123');
  expect(user.id).toBe('123');
});

// Bad
test('should fetch user', (done) => {
  fetchUser('123').then(user => {
    expect(user.id).toBe('123');
    done();
  });
});
```

### 7. Test Isolation

```javascript
beforeEach(async () => {
  // Clear database before each test
  await User.deleteMany({});
  await Room.deleteMany({});
});

afterEach(async () => {
  // Clean up after each test
  jest.clearAllMocks();
});
```

---

## Performance Testing

### Load Testing with Artillery

1. **Install Artillery**
   ```bash
   npm install -g artillery
   ```

2. **Create Load Test**
   
   Create `tests/load/api-load-test.yml`:
   ```yaml
   config:
     target: 'http://localhost:12000'
     phases:
       - duration: 60
         arrivalRate: 10
         name: Warm up
       - duration: 120
         arrivalRate: 50
         name: Sustained load
   scenarios:
     - name: 'User Registration and Login'
       flow:
         - post:
             url: '/api/auth/register'
             json:
               username: 'user{{ $randomNumber() }}'
               email: 'user{{ $randomNumber() }}@example.com'
               password: 'password123'
         - post:
             url: '/api/auth/login'
             json:
               email: '{{ email }}'
               password: 'password123'
   ```

3. **Run Load Test**
   ```bash
   artillery run tests/load/api-load-test.yml
   ```

---

## Troubleshooting

### Common Issues

1. **Tests Timeout**
   ```javascript
   // Increase timeout
   jest.setTimeout(10000);
   
   // Or per test
   test('slow test', async () => {}, 10000);
   ```

2. **Database Connection Issues**
   ```javascript
   // Ensure proper cleanup
   afterAll(async () => {
     await mongoose.connection.close();
   });
   ```

3. **Flaky Tests**
   ```javascript
   // Add proper waits
   await tester.pumpAndSettle();
   
   // Use retry logic
   test.retry(3)('flaky test', async () => {});
   ```

---

## Resources

- **Jest Documentation**: https://jestjs.io/
- **Flutter Testing**: https://flutter.dev/docs/testing
- **Supertest**: https://github.com/visionmedia/supertest
- **Selenium**: https://www.selenium.dev/
- **Appium**: https://appium.io/

---

**Happy Testing! 🧪**