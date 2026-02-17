// Get allowed origins from environment variable or use defaults
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174,https://wisatamagetan.xyz")
  .split(",")
  .map((o) => o.trim());

// Log allowed origins for debugging
console.log('[CORS] Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('[CORS] Request without origin header - allowing');
      return cb(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] Origin allowed:', origin);
      return cb(null, true);
    }
    
    // Log rejected origins for debugging
    console.error('[CORS] Origin rejected:', origin);
    console.error('[CORS] Allowed origins are:', allowedOrigins);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true, // Required for cookies and authorization headers
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

module.exports = corsOptions;