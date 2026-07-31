# Implementation Plan - Build Fixes & Auth Robustness

This plan addresses the critical build errors on Vercel and improves the reliability of the Reset Password/OTP system.

## Proposed Changes

### Frontend Fixes

#### [MODIFY] [JobCard.tsx](file:///E:/EduJobs%20Scholars/frontend/src/components/JobCard.tsx)
- Import `useEffect` from `react`.
- Import `ChevronRight` from `lucide-react`.

#### [MODIFY] [ServicesPage.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/public/ServicesPage.tsx)
- Import `useAuth` from context.

#### [MODIFY] [ApplicationTracker.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/student/ApplicationTracker.tsx)
- Import `ArrowRight` from `lucide-react`.

#### [MODIFY] [SavedOpportunities.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/student/SavedOpportunities.tsx)
- Re-verify and ensure `format` is correctly imported from `date-fns`.

---

### Backend Auth & Email Robustness

#### [MODIFY] [auth.controller.ts](file:///E:/EduJobs%20Scholars/backend/src/controllers/auth.controller.ts)
- Normalize email inputs in `forgotPassword` and `resendOTP` using `.trim().toLowerCase()`.
- Ensure consistent behavior regardless of environment in production (security).

#### [MODIFY] [sendEmail.ts](file:///E:/EduJobs%20Scholars/backend/src/utils/sendEmail.ts)
- Add detailed logging for email sending attempts and successes.
- Improve error handling to capture and report specific SMTP issues.

## Verification Plan

### Automated Tests
- I will verify the TypeScript compilation locally if possible, or advise the user to run `npm run build` in the frontend folder.

### Manual Verification
1.  **Build Verification**: Trigger a new Vercel build after these fixes.
2.  **OTP Flow**:
    - Test the "Forgot Password" flow with a **correctly spelled** email address.
    - Check the backend console logs (if accessible) to see "Attempting to send email..." and "Email sent successfully...".
3.  **Typo Check**: Remind the user that `gmail.om` in their screenshot is a typo for `gmail.com`.
