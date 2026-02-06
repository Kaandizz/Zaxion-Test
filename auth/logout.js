
function logout(username) {
  // Validate input
  if (!username) {
    return {
      success: false,
      message: 'Username is required'
    };
  }

  // Perform logout
  return {
    success: true,
    message: 'Logout successful',
    user: {
      username: username,
      logoutTime: new Date().toISOString()
    }
  };
}

// Example usage
console.log(logout('admin'));
console.log(logout('user1'));
console.log(logout(''));

module.exports = logout;

