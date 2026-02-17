const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://wisatamagetan.xyz")
  .split(",")
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, cb) => {
    // Memeriksa apakah origin ada dalam daftar allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true, // Ubah ke true jika nanti menggunakan cookie, atau tetap false jika hanya header
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

module.exports = corsOptions;