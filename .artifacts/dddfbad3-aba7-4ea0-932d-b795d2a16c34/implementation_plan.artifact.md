# Implementation Plan - Dynamic Services Management

This plan outlines the steps to make the "Services" page dynamic and interactive, allowing administrators to manage services via the dashboard.

## Proposed Changes

### Backend

#### [NEW] [Service.ts](file:///E:/EduJobs%20Scholars/backend/src/models/Service.ts)
- Create a Mongoose model for `Service`.
- Fields: `title` (String, required), `iconName` (String, required), `features` ([String], required), `order` (Number, default: 0).

#### [NEW] [service.controller.ts](file:///E:/EduJobs%20Scholars/backend/src/controllers/service.controller.ts)
- Implement CRUD operations:
    - `getServices`: Fetch all services sorted by order.
    - `createService`: Admin only.
    - `updateService`: Admin only.
    - `deleteService`: Admin only.

#### [NEW] [service.routes.ts](file:///E:/EduJobs%20Scholars/backend/src/routes/service.routes.ts)
- Register routes for the service controller.
- Use `protect` and `adminOnly` middleware for write operations.

#### [MODIFY] [index.ts](file:///E:/EduJobs%20Scholars/backend/src/index.ts)
- Register the new `serviceRoutes` under `/api/services`.

#### [MODIFY] [seed.ts](file:///E:/EduJobs%20Scholars/backend/src/seed.ts)
- Add initial services (Application Support, Irembo, etc.) to the seed script to ensure they are available in the database on system start.

---

### Frontend

#### [MODIFY] [api/index.ts](file:///E:/EduJobs%20Scholars/frontend/src/api/index.ts)
- Add `serviceAPI` object with methods for `getAll`, `create`, `update`, and `delete`.

#### [NEW] [ManageServices.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/admin/ManageServices.tsx)
- Create an admin page for managing services.
- Table view of all services.
- Modal for adding/editing a service (handling features as a list of strings and icon selection).

#### [MODIFY] [AdminLayout.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/admin/AdminLayout.tsx)
- Add "Manage Services" to the sidebar navigation.

#### [MODIFY] [App.tsx](file:///E:/EduJobs%20Scholars/frontend/src/App.tsx)
- Register the new `/admin/services` route.

#### [MODIFY] [ServicesPage.tsx](file:///E:/EduJobs%20Scholars/frontend/src/pages/public/ServicesPage.tsx)
- Update the page to fetch services from the backend.
- Map `iconName` strings to actual Lucide components.
- Add smooth animations using `framer-motion` for a modern and interactive feel.

## Verification Plan

### Automated Tests
- I will verify the API endpoints using `curl` commands in the shell.

### Manual Verification
1.  **Seed Verification**: Run the seed script and verify services are in the database.
2.  **Admin CRUD**: Log in as admin, add a new service, edit its features, change the order, and delete it.
3.  **Public View**: Navigate to `/services` as a guest/student and verify the services load dynamically with smooth animations.
4.  **Interaction**: Click "Request Service" on a dynamic service and verify the multi-step assistance request flow still works correctly.
