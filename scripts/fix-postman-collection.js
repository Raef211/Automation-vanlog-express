#!/usr/bin/env node

/**
 * Fix Postman Collection - Replaces {{baseUrl}} and {{baseurl}} with actual URL
 */

const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '../postman/TUNLOG_full_postman_collection.json');
const baseUrl = process.env.POSTMAN_BASE_URL || 'http://localhost:6001';

console.log(`🔧 Fixing Postman Collection...`);
console.log(`📍 Base URL: ${baseUrl}\n`);

try {
  // Read collection
  const collectionData = fs.readFileSync(collectionPath, 'utf8');
  let collection = JSON.parse(collectionData);

  // Replace baseUrl variables in all items
  const replaceVariables = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/{{baseUrl}}/g, baseUrl).replace(/{{baseurl}}/g, baseUrl);
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceVariables);
    }
    if (obj !== null && typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        result[key] = replaceVariables(obj[key]);
      }
      return result;
    }
    return obj;
  };

  collection = replaceVariables(collection);

  // Write back
  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  console.log('✅ Collection fixed successfully!');
  console.log(`   All {{baseUrl}} and {{baseurl}} replaced with: ${baseUrl}`);
} catch (error) {
  console.error('❌ Error fixing collection:', error.message);
  process.exit(1);
}
