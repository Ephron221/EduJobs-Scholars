# Implementation Plan - Fixing 500 Errors & SMTP Authentication

This plan addresses the widespread `500 Internal Server Error` on the deployed site and the Gmail authentication failure.

## Root Cause Analysis
1.  **500 Errors**: Most likely caused by a failed or timed-out MongoDB connection. In serverless environments (Vercel), top-level async calls like `connectDB()` can sometimes finish *after* the request handler starts, leading to "Not connected" errors.
2.  **SMTP 535 Error**: Explicitly confirmed as "BadCredentials". This means the `EMAIL_PASS` in Vercel is either your normal password (blocked by Google) or an expired App Password.

## Proposed Changes

### Backend - Database & Reliability

#### [MODIFY] [database.ts](file:///E:/EduJobs%20Scholars/backend/src/config/database.ts)
- Update `connectDB` to return the connection promise and include optimized settings for serverless (`serverSelectionTimeoutMS`, `socketTimeoutMS`).

#### [MODIFY] [index.ts](file:///E:/EduJobs%20Scholars/backend/src/index.ts)
- **Database Middleware**: Add a middleware that ensures the database is connected *before* proceeding to any API route. This is the safest way to handle connections in Vercel.
- **Enhanced Health Check**: Ensure the health check reports detailed DB status to verify connectivity.
- **Error Verbosity**: Temporarily enable error messages in the 500 response (even in production) so we can see the exact error on the screen if it fails again.

### Backend - SMTP

#### [MODIFY] [auth.controller.ts](file:///E:/EduJobs%20Scholars/backend/src/controllers/auth.controller.ts)
- Ensure all SMTP errors are caught and returned with full detail to the frontend for easier debugging.

---

## User Action Required ⚠️

### 1. MongoDB Atlas IP Access
Ensure your MongoDB Atlas project allows connections from Vercel:
- Go to **Network Access** in MongoDB Atlas.
- Add IP Address: `0.0.0.0/0` (Allow access from anywhere). This is required for Vercel.

### 2. Gmail App Password
The error **"Invalid login: 535-5.7.8"** means your password is being rejected.
- Go to your Google Account -> Security -> **App Passwords**.
- Create a new one and use the **16-character code** as your `EMAIL_PASS` in Vercel.

## Verification Plan
1.  **Health Check**: Visit `https://edujobscholars-backend.vercel.app/api/health`. It should show `database: { connected: true }`.
2.  **Login Test**: Try logging in. If it fails, the 500 error will now contain a "message" and "error" field explaining why.
3.  **Data Fetching**: Verify the home page loads universities and hero images.
