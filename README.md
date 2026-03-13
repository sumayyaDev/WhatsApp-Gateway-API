---
title: WhatsApp Gateway API
author: Sumayya Akter
date: 2026-03-12
---
# WhatsApp Gateway API - Production Ready System

A production-ready Node.js backend application, for WhatsApp Web integration with QR code authentication, real-time updates via Socket.IO, message queuing and comprehensive error handling.

## 📋 Tech Stack

- **Backend**: Node.js (ES Modules)
- **Framework**: Express.js
- **UI**: EJS Templates
- **Real-time**: Socket.IO 
- **WhatsApp Integration**: whatsapp-web.js
- **Authentication**: QR Code based
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit
- **Session Management**: File-based (LocalAuth)

----

### Installation and Setup the sever
  ```terminal/bash```
 - **Step-1: npm install
 - **Step-2: npm run dev
 - **Step-3: visit: http://localhost:3000

## Using the Dashboard

### First Run - Authentication card/form

1. Click **"Authenticate WhatsApp"** button
2. A QR code will appear
3. Open WhatsApp on your phone
4. Go to <Settings> → <Linked-Devices> → <Link-a-Device>
5. Scan the QR code
6. Wait for message: **"✅ WhatsApp Connected!"**

### Sending Messages

1. Enter **Phone Number** (format: +8801700****** or 01700******)
2. Enter **Message**
3. Click **"Send Message"**
4. Check **Queue Status** for confirmation

---

## ✨ Features

### Core Features
-  **QR Code Authentication** - Real-time QR code generation and scanning via Socket.IO
-  **Session Persistence** - Automatic session restoration after server restart (no re-authentication needed)
-  **Message Queuing** - Concurrent message handling with queue management and retry logic
-  **Real-time Updates** - WebSocket-based real-time status updates via Socket.IO

### API Features
-  **RESTful API** - Clean, well-structured REST endpoints
-  **Request Validation** - Comprehensive input validation for all requests
-  **Rate Limiting** - Built-in rate limiting to prevent API abuse
-  **Error Handling** - Centralized error handling with custom error types
-  **Logging** - Structured logging with Winston for debugging and monitoring

---

## ⚙️ Project Structure

```
whatsapp-project/
├── config/
│   └── config.js              # Centralized configuration
├── constants/
│   └── constants.js           # Global constants
├── middleware/
│   ├── errorHandler.js        # Global error handling
│   ├── validation.js          # Request validation
│   └── requestLogger.js       # Request logging
├── controllers/
│   └── messageController.js   # API controller
├── services/
│   └── whatsappService.js     # WhatsApp integration
├── routes/
│   └── messageRoutes.js       # API routes
├── sockets/
│   └── socketHandler.js       # Socket.IO handlers
├── utils/
│   ├── logger.js              # Winston logger
│   ├── queueManager.js        # Message queue management
│   └── CustomError.js         # Custom error classes
├── views/
│   └── dashboard.ejs          # Frontend dashboard
├── logs/                       # Log files
├── .wwebjs_auth/              # WhatsApp sessions (auto-created)
├── .env                        # Environment variables
├── app.js                      # Express app setup
├── index.js                    # Server entry point
├── package.json               # Dependencies
└── package-lock.json          # Lock file
```
---

## 🔒 Error Handling

The system provides comprehensive error handling:

### Error Types

1. **ValidationError** (400) - Invalid request data
2. **AuthenticationError** (401) - Authentication failed
3. **WhatsAppError** (503) - WhatsApp service unavailable
4. **QueueError** (409) - Queue full or management issue
5. **RateLimitError** (429) - Rate limit exceeded
6. **ServiceUnavailableError** (503) - Service unavailable

---

## 📝 Queue Management

**Features**:
- Concurrent message processing
- Automatic retry with exponential backoff
- Queue statistics and monitoring
- Priority-based processing

**Configuration**:
```bash
QUEUE_MAX_RETRIES=3
QUEUE_RETRY_DELAY=5000
QUEUE_CONCURRENT_LIMIT=5
```
---

## ⛔ Graceful Shutdown

The server handles graceful shutdown:
- Closes HTTP server
- Disconnects WhatsApp client
- Saves session
- Cleans up resources

---

## 🛠️ Troubleshooting

### WhatsApp Not Connecting

1. Check if Puppeteer is properly installed
2. Ensure Chrome/Chromium is installed
3. Check logs: `tail -f logs/app.log`
4. Verify `.wwebjs_auth` directory exists
5. Try deleting session: `rm -rf .wwebjs_auth`

### QR Code Not Displaying

1. Ensure Socket.IO connection is active
2. Check browser console for errors
3. Verify dashboard is accessible

### Messages Not Sending

1. Verify WhatsApp is "Connected" in dashboard
2. Check queue status: `GET /api/queue/status`
3. Review error logs: `logs/error.log`
4. Ensure phone number format is correct

---

## 📚 Resources and Documentation

- [WhatsApp Web.js Documentation](https://weba-um.github.io/whatsapp-web.js/)
- [Express.js Guide](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Winston Logger Guide](https://github.com/winstonjs/winston)

---

## ✨ Future Enhancements

- [ ] Database integration for message history
- [ ] Multiple WhatsApp account support
- [ ] Message scheduling
- [ ] Group messaging
- [ ] Analytics dashboard
- [ ] API key/ Token-based authentication

---

                            
                            *****   ⭐⭐⭐⭐⭐   *****
