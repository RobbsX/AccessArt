const { login } = require('solid-auth-client');

async function authenticate() {
  try {
    await login();
    console.log('Authentication successful!');
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

authenticate();
