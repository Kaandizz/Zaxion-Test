//Overrriden Enter for Done and Shift+Enter for New Line
//before moving to the next module, let's implement the logout functionality for the Zaxion, ensuring that users can securely end their sessions and protect their accounts from unauthorized access.

//Solving the probelm terminal problem of the Zaxion.
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

