# Implementation Plan - Enable CRUD for Assistants on Announcements Page

This plan focuses on allowing users with the "Assistant" role to perform Create, Read, Update, and Delete operations on the Announcements page, ensuring they have full administrative control over broadcasts and notifications.

## Proposed Changes

### Backend

#### [MODIFY] [notification.routes.ts](file:///E:/EduJobs%20Scholars/backend/src/routes/notification.routes.ts)
- Update administrative routes to use `staffOnly` instead of `adminOnly`.
- Impacted routes:
    - `POST /announcement` (Create)
    - `GET /admin` (List All)
    - `GET /stats` (Statistics)
    - `PUT /:id` (Update)
    - `DELETE /:id` (Delete)

### Frontend

#### [MODIFY] [notificationAPI](file:///E:/EduJobs%20Scholars/frontend/src/api/index.ts)
- (Verification) Ensure frontend correctly calls these endpoints.

#### [MODIFY] [Announcements.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/admin/Announcements.tsx)
- (Verification) Ensure UI elements (Edit, Delete) are visible and active for Assistants. (Currently, the page is accessible via `AdminLayout` for both roles, but the backend rejects requests from Assistants).

## Verification Plan

### Manual Verification
1.  **Login as Assistant**: Log in with an account having the `assistant` role.
2.  **Access Page**: Navigate to the "Announcements" section.
3.  **Create**: Compose and send a new broadcast message.
4.  **Read/View**: Verify that the "History" tab loads the list of sent messages and "Stats" are visible.
5.  **Update**: Edit an existing announcement from the history.
6.  **Delete**: Permanently delete an announcement and confirm it disappears from the history.
