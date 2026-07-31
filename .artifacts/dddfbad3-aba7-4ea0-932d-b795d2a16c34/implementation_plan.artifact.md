# Implementation Plan - Fixing SMTP/OTP Failure on Deployed System

This plan addresses the 500 error when sending OTPs on the deployed Vercel system by improving SMTP robustness and providing better error visibility.

## User Review Required
> [!IMPORTANT]
> Since the error occurs on the deployed system, the root cause is likely an SMTP connection timeout or a configuration issue in the Vercel Environment Variables.

## Proposed Changes

### Backend

#### [MODIFY] [sendEmail.ts](file:///E:/EduJobs%20Scholars/backend/src/utils/sendEmail.ts)
- **Improve Robustness**:
    - Add `tls: { rejectUnauthorized: false }` to prevent certificate issues common in some hosting environments.
    - Set `connectionTimeout`, `greetingTimeout`, and `socketTimeout` to ensure the function doesn't hang indefinitely (critical for serverless).
    - Remove `transporter.verify()` in production to reduce latency and prevent unnecessary round-trips.
- **Enhanced Configuration**: Support both `secure: true` (port 465) and `secure: false` (port 587/25) explicitly based on the port.

#### [MODIFY] [auth.controller.ts](file:///E:/EduJobs%20Scholars/backend/src/controllers/auth.controller.ts)
- **Error Transparency**: Update the catch block to return a more descriptive error message in the API response if a certain debug flag is set, helping to diagnose the exact SMTP error without checking server logs.

### Frontend

#### [MODIFY] [ForgotPassword.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/public/ForgotPassword.tsx)
- **Better Feedback**: Ensure the UI displays the specific error message returned by the server if available, rather than a generic "Email could not be sent".

## Verification Plan

### Manual Verification
1.  **Local Test**: Verify that emails still send correctly in the local environment.
2.  **Deployment Verification**: Push changes to Vercel and test the "Forgot Password" flow.
3.  **Log Check**: If it still fails, the UI will now hopefully show a more specific error (e.g., "ETIMEDOUT" or "Authentication Failed"), which will allow us to pinpoint the exact SMTP configuration that needs adjustment in the Vercel dashboard.
