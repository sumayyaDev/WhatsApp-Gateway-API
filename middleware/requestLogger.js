import { logHTTP } from '../utils/logger.js';

// === HTTP request logging ===
// TODO: Request logging middleware
// TODO: Duration measurement
// TODO: HTTP metadata logging

 // Request logging middleware
 // Logs all incoming HTTP requests
export const requestLogger = (req, res, next) => {
  
  const startTime = Date.now();

  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;

    logHTTP(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      responseSize: JSON.stringify(data).length,
    });

    return originalJson.call(this, data);
  };

  next();
};

export default requestLogger;
