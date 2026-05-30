// src/config/cors.js

// Origin yang SELALU diizinkan (dev lokal + domain production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://wisatamagetan.xyz",
  "https://www.wisatamagetan.xyz"
];

// Saat development, kita izinkan juga akses dari IP LAN (HP di WiFi yang sama),
// contoh: http://192.168.1.10:5173. Ini supaya bisa tes login langsung dari HP.
const isDev = process.env.NODE_ENV !== "production";

// Cocokkan localhost / 127.0.0.1 / IP privat (10.x, 172.16-31.x, 192.168.x) + port apa pun
const lanOriginRegex =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan tools tanpa origin (Postman, curl, mobile app native)
    if (!origin) return callback(null, true);

    // Izinkan origin yang ada di whitelist
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Saat development, izinkan origin LAN (HP via WiFi yang sama)
    if (isDev && lanOriginRegex.test(origin)) return callback(null, true);

    // Selain itu, tolak
    return callback(new Error(`Origin tidak diizinkan oleh CORS: ${origin}`));
  },

  // Wajib true agar cookie/token bisa lewat
  credentials: true,

  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
