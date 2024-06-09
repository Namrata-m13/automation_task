const axios = require('axios');

const instance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' }
});

module.exports = instance;