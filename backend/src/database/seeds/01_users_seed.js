const bcrypt = require('bcryptjs');
require('dotenv').config(); // Penting! Agar bisa baca file .env

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // =========================================================
  // 1. SETUP PASSWORD (ENV atau DEFAULT)
  // =========================================================
  // Logika: Cek .env dulu. Kalau kosong, pakai "rahasia123"
  const passwordRaw = process.env.DEFAULT_PASSWORD || "rahasia123";
  
  // Hash password tersebut
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordRaw, salt);

  console.log(`🔒 Seeding User dengan Password: "${passwordRaw}"`);

  // =========================================================
  // 2. BERSIHKAN DATA LAMA
  // =========================================================
  await knex('admin').del();
  await knex('wisatawan').del();

  // =========================================================
  // 3. INSERT ADMIN (Password Sama)
  // =========================================================
  await knex('admin').insert([
    {
      username: 'Super Admin',
      email: 'admin@wisata.com',
      password: hashedPassword, // Pakai password yang sama
    }
  ]);

  // =========================================================
  // 4. INSERT WISATAWAN (Password Sama)
  // =========================================================
// =========================================================
// 4. INSERT WISATAWAN (Password Sama) — 7 wisatawan
// =========================================================
await knex('wisatawan').insert([
  { username: 'Budi Traveler',    email: 'budi@gmail.com',   password: hashedPassword },
  { username: 'Siti Petualang',   email: 'siti@gmail.com',   password: hashedPassword },
  { username: 'Andi Backpacker',  email: 'andi@gmail.com',   password: hashedPassword },
  { username: 'Dewi Explorer',    email: 'dewi@gmail.com',   password: hashedPassword },
  { username: 'Eko Wanderer',     email: 'eko@gmail.com',    password: hashedPassword },
  { username: 'Fitri Adventurer', email: 'fitri@gmail.com',  password: hashedPassword },
  { username: 'Gilang Nomad',     email: 'gilang@gmail.com', password: hashedPassword },
]);

  console.log("✅ Seed Data Berhasil! Admin & Wisatawan passwordnya sama.");
};