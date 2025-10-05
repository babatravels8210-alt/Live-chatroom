# 🤝 Contributing to Live Chatroom

Thank you for your interest in contributing to Live Chatroom! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Publishing others' private information
- Any conduct that could be considered inappropriate in a professional setting

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Git** installed and configured
2. **Node.js** 16.x or higher
3. **MongoDB** 6.0 or higher
4. **Flutter** 3.16+ (for mobile contributions)
5. A **GitHub account**

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Live-chatroom.git
   cd Live-chatroom
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/babatravels8210-alt/Live-chatroom.git
   ```

4. **Install dependencies:**
   ```bash
   # Backend
   npm install
   
   # Frontend
   cd client && npm install && cd ..
   
   # Flutter
   flutter pub get
   ```

5. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

**Examples:**
- `feature/add-video-chat`
- `fix/socket-connection-issue`
- `docs/update-api-documentation`

### 2. Make Changes

1. **Write clean, readable code**
2. **Follow coding standards** (see below)
3. **Add tests** for new features
4. **Update documentation** as needed

### 3. Test Your Changes

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test

# Run Flutter tests
flutter test

# Check code style
npm run lint
```

### 4. Commit Your Changes

Follow our commit message guidelines (see below):

```bash
git add .
git commit -m "feat: add video chat feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the pull request

---

## Coding Standards

### JavaScript/TypeScript

**Style Guide:**
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Maximum line length: 100 characters

**Example:**
```javascript
// Good
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error('User not found');
  }
};

// Bad
const get_user_by_id = async (user_id) => 
{
    const user = await User.findById(user_id)
    return user
}
```

**ESLint Configuration:**
```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}
```

### Dart/Flutter

**Style Guide:**
- Use 2 spaces for indentation
- Follow Flutter style guide
- Use lowerCamelCase for variables
- Use UpperCamelCase for classes
- Use snake_case for file names

**Example:**
```dart
// Good
class UserProfile extends StatelessWidget {
  final String userName;
  final String userEmail;

  const UserProfile({
    Key? key,
    required this.userName,
    required this.userEmail,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text(userName),
    );
  }
}

// Bad
class user_profile extends StatelessWidget {
  String UserName;
  String UserEmail;
  
  Widget build(context) {
    return Container(child: Text(UserName));
  }
}
```

### File Organization

**Backend:**
```
routes/
  ├── auth.js          # Authentication routes
  ├── users.js         # User management routes
  └── rooms.js         # Room management routes

models/
  ├── User.js          # User model
  ├── Room.js          # Room model
  └── Message.js       # Message model

middleware/
  ├── auth.js          # Authentication middleware
  └── validation.js    # Input validation
```

**Frontend:**
```
src/
  ├── components/      # Reusable components
  ├── pages/          # Page components
  ├── services/       # API services
  ├── hooks/          # Custom hooks
  └── utils/          # Utility functions
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

**Feature:**
```
feat(voice-chat): add mute/unmute functionality

- Add mute button to voice controls
- Implement mute state management
- Add visual indicator for muted state

Closes #123
```

**Bug Fix:**
```
fix(auth): resolve token expiration issue

- Update JWT expiration time
- Add token refresh logic
- Fix logout on token expiry

Fixes #456
```

**Documentation:**
```
docs(api): update authentication endpoints

- Add examples for login/register
- Document error responses
- Update rate limiting information
```

### Commit Message Rules

1. Use imperative mood ("add" not "added")
2. Don't capitalize first letter
3. No period at the end
4. Keep subject line under 50 characters
5. Separate subject from body with blank line
6. Wrap body at 72 characters
7. Reference issues and PRs in footer

---

## Pull Request Process

### Before Submitting

1. **Update your branch:**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run all tests:**
   ```bash
   npm test
   npm run lint
   ```

3. **Update documentation:**
   - Update README if needed
   - Add/update API documentation
   - Update user guide if applicable

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #issue_number
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** required
3. **All comments** must be resolved
4. **Conflicts** must be resolved
5. **Documentation** must be updated

### After Approval

1. Squash commits if requested
2. Rebase on main if needed
3. Maintainer will merge the PR

---

## Testing Requirements

### Backend Tests

**Required:**
- Unit tests for new functions
- Integration tests for API endpoints
- Minimum 75% code coverage

**Example:**
```javascript
describe('User Authentication', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Tests

**Required:**
- Component tests for new components
- Integration tests for user flows
- Snapshot tests for UI components

**Example:**
```typescript
describe('RoomCard Component', () => {
  test('renders room information', () => {
    const room = {
      name: 'Test Room',
      description: 'Test Description',
      participantCount: 10
    };

    render(<RoomCard room={room} />);

    expect(screen.getByText('Test Room')).toBeInTheDocument();
    expect(screen.getByText('10 participants')).toBeInTheDocument();
  });
});
```

### Flutter Tests

**Required:**
- Widget tests for new widgets
- Unit tests for business logic
- Integration tests for user flows

**Example:**
```dart
testWidgets('RoomCard displays room information', (WidgetTester tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: RoomCard(
        room: Room(
          name: 'Test Room',
          participantCount: 10,
        ),
      ),
    ),
  );

  expect(find.text('Test Room'), findsOneWidget);
  expect(find.text('10 participants'), findsOneWidget);
});
```

---

## Documentation

### Code Comments

**When to comment:**
- Complex algorithms
- Non-obvious business logic
- Workarounds or hacks
- Public APIs

**Example:**
```javascript
/**
 * Generates Agora RTC token for voice chat
 * @param {string} channelName - Name of the voice channel
 * @param {string} userId - User ID requesting token
 * @param {string} role - User role (host, speaker, audience)
 * @returns {Promise<string>} Agora RTC token
 */
const generateAgoraToken = async (channelName, userId, role) => {
  // Implementation
};
```

### API Documentation

Update API documentation for:
- New endpoints
- Changed request/response formats
- New query parameters
- Error responses

### User Documentation

Update user guide for:
- New features
- Changed workflows
- New UI elements
- Troubleshooting steps

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## Questions?

- **GitHub Discussions**: Ask questions and discuss ideas
- **GitHub Issues**: Report bugs and request features
- **Email**: dev@example.com

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Live Chatroom! 🎉**