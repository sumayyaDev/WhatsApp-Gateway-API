import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config/config.js';
import messageRoutes from './routes/messageRoutes.js';
import { requestLogger } from './middleware/requestLogger.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.js';
import { validationMiddleware } from './middleware/validation.js';
import { logInfo } from './utils/logger.js';

// === Express application setup ===
// Middleware configuration (CORS, body parser, rate limiting)
// Request logging
// Validation middleware
// EJS template setup
// Dashboard route

const app = express();

// ===== MIDDLEWARE SETUP =====

// Trust proxy
app.set('trust proxy', 1);

// Body parser middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request logging middleware
app.use(requestLogger);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    status: "error",
    message:
      "Too many requests from this IP. Please try again later.",
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Request validation middleware
app.use(validationMiddleware);

// ===== ROUTES =====

// Public routes
app.get("/", (req, res) => {
  // Render dashboard UI for browsers
  if (req.accepts("html")) {
    return res.render("dashboard");
  }

  res.json({
    status: "success",
    message: "WhatsApp Backend API",
    version: "1.0.0",
    endpoints: {
      "POST /api/send-message": "Send message via WhatsApp",
      "GET /api/status": "Get WhatsApp and Queue status",
      "GET /api/queue/status": "Get queue statistics",
      "POST /api/initialize": "Initialize WhatsApp",
      "GET /": "API documentation",
    },
  });
});

// API routes
app.use("/api", messageRoutes);

// ===== EJS CONFIGURATION =====

app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files
app.use(express.static("public"));

// Dashboard route (legacy)
app.get("/dashboard", (req, res) => {
  // Redirect to root so the dashboard renders at http://<host>:<port>
  res.redirect("/");
});

// ===== ERROR HANDLING =====

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===== INITIALIZATION LOG =====
logInfo("Express app configured", {
  nodeEnv: config.server.nodeEnv,
  corsOrigin: config.cors.origin,
  rateLimitWindow: config.rateLimit.windowMs,
  rateLimitMax: config.rateLimit.maxRequests,
});

export default app;