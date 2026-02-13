const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5174")
  .split(",")
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: false, // JWT via header -> false
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

module.exports = corsOptions;
