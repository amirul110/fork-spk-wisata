// knexfile.js
require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    // PENTING: Ubah client menjadi 'mysql2'
    client: 'mysql2', 
    
    connection: {
      host: process.env.DB_HOST || '127.0.0.1', // Localhost
      user: process.env.DB_USER || 'root',       // User default XAMPP biasanya root
      password: process.env.DB_PASSWORD || '',   // Password default XAMPP biasanya kosong
      database: process.env.DB_NAME || 'spk_wisata_db',
      port: 3306
    },
    
    // Lokasi folder yang sudah kita bahas sebelumnya
    migrations: {
      directory: './src/database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'js'
    }
  }

};