// src/database/connection.js
require('dotenv').config();
const knex = require('knex');
const knexConfig = require('../../knexfile.js'); // Mundur 2 folder ke root

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

module.exports = { db };