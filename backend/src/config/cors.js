// src/config/cors.js

// Gunakan Array langsung agar Express CORS lebih mudah membacanya saat request OPTIONS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://wisatamagetan.xyz",
  "https://www.wisatamagetan.xyz"
];

const corsOptions = {
  // CORS akan otomatis mengecek apakah origin pengirim ada di dalam array ini
  origin: allowedOrigins,
  
  // INI KUNCI UTAMANYA: Wajib true agar cookie/token bisa lewat
  credentials: true, 
  
  // Tambahkan beberapa header standar yang sering dipakai Axios
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200
};

module.exports = corsOptions;