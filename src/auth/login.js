// Simple Login Function
function login(username, password) {
  // Mock database of users
  const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
  ];

  // Validate input
  if (!username || !password) {
    return {
      success: false,
      message: 'Username and password are required'
    };
  }

  // Check if user exists
  const user = users.find(u => u.username === username);

  if (!user) {
    return {
      success: false,
      message: 'Invalid username'
    };
  }

  // Verify password
  if (user.password !== password) {
    return {
      success: false,
      message: 'Invalid password'
    };
  }

  // Successful login
  return {
    success: true,
    message: 'Login successful',
    user: {
      username: user.username,
      loginTime: new Date().toISOString()
    }
  };
}

// Example usage
console.log(login('admin', 'admin123'));
console.log(login('user1', 'wrongpassword'));
console.log(login('', ''));

module.exports = login;
