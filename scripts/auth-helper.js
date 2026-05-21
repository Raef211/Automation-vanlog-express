#!/usr/bin/env node

/**
 * Authentication Helper for Postman Tests
 * Handles login and provides auth token for API requests
 */

const https = require('https');
const http = require('http');

/**
 * Login to the API and get authentication token
 * @param {string} baseUrl - API base URL (e.g., http://localhost:6001)
 * @param {object} credentials - Login credentials {email, password}
 * @returns {Promise<string>} - Auth token
 */
async function authenticate(baseUrl = 'http://localhost:6001', credentials = {}) {
  // Check for pre-generated token from environment variable first
  if (process.env.AUTH_TOKEN) {
    console.log('✅ Using provided AUTH_TOKEN from environment');
    return process.env.AUTH_TOKEN;
  }

  return new Promise((resolve, reject) => {
    // Use real credentials if not provided
    const email = credentials.email || 'support@vanlog-express.com';
    const password = credentials.password || 'y8JZ5Utcw7Q+n(CnQ';

    const payload = JSON.stringify({
      email: email,
      password: password
    });

    const urlObj = new URL(baseUrl);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Try different token field names
            const token = response.accessToken || response.access_token || response.token || response.Authorization;
            if (token) {
              console.log('✅ Authentication successful');
              resolve(token);
            } else {
              console.warn('⚠️  No token found in response. Using demo mode.');
              resolve('demo-token-for-testing');
            }
          } else {
            console.warn(`⚠️  Login failed (${res.statusCode}). Response:`, JSON.stringify(response).substring(0, 200));
            resolve('demo-token-for-testing');
          }
        } catch (e) {
          console.warn('⚠️  Could not parse auth response. Using demo token.');
          resolve('demo-token-for-testing');
        }
      });
    });

    req.on('error', (error) => {
      console.warn('⚠️  Authentication request failed:', error.message);
      // Return a demo token so tests can continue
      resolve('demo-token-for-testing');
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Create an environment object with auth token
 * @param {string} token - Auth token
 * @param {string} baseUrl - API base URL
 * @returns {object} - Postman environment object
 */
function createAuthEnvironment(token, baseUrl = 'http://localhost:6001') {
  return {
    id: 'auth-environment',
    name: 'Auth Environment',
    values: [
      {
        key: 'baseUrl',
        value: baseUrl,
        enabled: true
      },
      {
        key: 'baseurl',
        value: baseUrl,
        enabled: true
      },
      {
        key: 'token',
        value: token,
        enabled: true
      },
      {
        key: 'Authorization',
        value: `Bearer ${token}`,
        enabled: true
      }
    ]
  };
}

module.exports = {
  authenticate,
  createAuthEnvironment
};
