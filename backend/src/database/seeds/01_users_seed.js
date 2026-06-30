const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const passwordRaw = process.env.DEFAULT_PASSWORD || "rahasia123";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordRaw, salt);

  console.log(`🔒 Seeding User dengan Password: "${passwordRaw}"`);

  await knex('admin').insert([
    { username: 'Super Admin', email: 'admin@wisata.com', password: hashedPassword },
  ]);

  // 7 wisatawan
  await knex('wisatawan').insert([
    { username: 'Budi Traveler',    email: 'budi@gmail.com',   password: hashedPassword },
    { username: 'Siti Petualang',   email: 'siti@gmail.com',   password: hashedPassword },
    { username: 'Andi Backpacker',  email: 'andi@gmail.com',   password: hashedPassword },
    { username: 'Dewi Explorer',    email: 'dewi@gmail.com',   password: hashedPassword },
    { username: 'Eko Wanderer',     email: 'eko@gmail.com',    password: hashedPassword },
    { username: 'Fitri Adventurer', email: 'fitri@gmail.com',  password: hashedPassword },
    { username: 'Gilang Nomad',     email: 'gilang@gmail.com', password: hashedPassword },
  ]);

  console.log("✅ Seed 7 wisatawan + 1 admin berhasil.");
};