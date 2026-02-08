//Testing the Zaxion after CI stregthening and security hardening.

const crypto = require('crypto');

// Session storage
const activeSessions = new Map();
const loginAttempts = new Map();

// Mock database of users with more details
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_users'],
    status: 'active',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    passwordHash: hashPassword('password1'),
    role: 'user',
    permissions: ['read', 'write'],
    status: 'active',
    createdAt: new Date('2025-06-15')
  },
  {
    id: 3,
    username: 'user2',
    email: 'user2@example.com',
    passwordHash: hashPassword('password2'),
    role: 'user',
    permissions: ['read'],
    status: 'inactive',
    createdAt: new Date('2025-07-20')
  }
];

// Utility function to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Utility function to generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if user is rate limited (too many failed attempts)
function isRateLimited(username) {
  const attempts = loginAttempts.get(username);
  if (!attempts) return false;
  
  const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
  const isLimited = attempts.count >= 5 && timeSinceLastAttempt < 15 * 60 * 1000; // 15 minutes
  
  if (timeSinceLastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(username);
    return false;
  }
  
  return isLimited;
}

// Record failed login attempt
function recordFailedAttempt(username) {
  if (!loginAttempts.has(username)) {
    loginAttempts.set(username, { count: 1, lastAttempt: Date.now() });
  } else {
    const attempt = loginAttempts.get(username);
    attempt.count++;
    attempt.lastAttempt = Date.now();
  }
}

// Clear login attempts on successful login
function clearLoginAttempts(username) {
  loginAttempts.delete(username);
}

// Main login function
function login(username, password, options = {}) {
  try {
    // Validate input
    if (!username || !password) {
      return {
        success: false,
        code: 'INVALID_INPUT',
        message: 'Username and password are required'
      };
    }

    // Trim inputs
    username = username.trim();
    password = password.trim();

    // Check rate limiting
    if (isRateLimited(username)) {
      return {
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many failed login attempts. Please try again later.'
      };
    }

    // Find user
    const user = users.find(u => u.username === username);

    if (!user) {
      recordFailedAttempt(username);
      return {
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Invalid credentials'
      };
    }

    // Check user status
    if (user.status !== 'active') {
      recordFailedAttempt(username);
      return {
        success: false,
        code: 'USER_INACTIVE',
        message: 'User account is inactive'
      };
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      recordFailedAttempt(username);
      return {
        success: false,
        code: 'INVALID_PASSWORD',
        message: 'Invalid credentials'
      };
    }

    // Clear failed attempts
    clearLoginAttempts(username);

    // Generate session token
    const token = generateToken();
    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Store session
    activeSessions.set(token, sessionData);

    // Successful login
    return {
      success: true,
      code: 'LOGIN_SUCCESS',
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      sessionData: sessionData
    };
  } catch (error) {
    return {
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred during login',
      error: error.message
    };
  }
}

// Validate session token
function validateSession(token) {
  if (!activeSessions.has(token)) {
    return { valid: false, message: 'Invalid or expired token' };
  }

  const session = activeSessions.get(token);
  
  if (new Date(session.expiresAt) < new Date()) {
    activeSessions.delete(token);
    return { valid: false, message: 'Session expired' };
  }

  return { valid: true, session: session };
}

// Get active sessions count
function getActiveSessions() {
  return activeSessions.size;
}

// Example usage
console.log('=== Login Tests ===');
console.log(login('admin', 'admin123'));
console.log('\n=== Inactive User Test ===');
console.log(login('user2', 'password2'));
console.log('\n=== Invalid Password Test ===');
console.log(login('user1', 'wrongpassword'));
console.log('\n=== Rate Limiting Test ===');
for (let i = 0; i < 6; i++) {
  console.log(`Attempt ${i + 1}:`, login('testuser', 'wrong').code);
}
console.log('\n=== Session Count ===');
console.log(`Active sessions: ${getActiveSessions()}`);

module.exports = {
  login,
  validateSession,
  getActiveSessions
};
