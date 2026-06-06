# VendorBridge

VendorBridge is a full-stack procurement workflow application for managing vendor onboarding, RFQs, quotations, approvals, purchase orders, invoices, reports, notifications, and activity logs.

The app is organized as a React/Vite client and an Express/MongoDB API. It is built around a role-based procurement cycle: internal users create and send RFQs, vendors submit quotations, managers approve selected bids, and the system generates purchase orders and draft invoices.

## Features

- Role-based access for Admin, Procurement Officer, Manager, and Vendor users.
- JWT authentication with protected routes on both the client and API.
- Vendor registration and vendor master data management.
- RFQ creation, vendor assignment, sending, status tracking, and vendor-filtered RFQ views.
- Vendor quotation submission with duplicate-submission protection per RFQ/vendor pair.
- Quotation comparison sorted by total amount with lowest item-price highlights.
- Approval requests for selected quotations.
- Manager approval/rejection workflow.
- Automatic purchase order and draft invoice creation after approval.
- Invoice PDF download and optional invoice email delivery.
- Dashboard metrics, spend reports, top vendor reports, monthly trend charts, notifications, and activity logs.

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Recharts, Lucide React, Axios.
- Backend: Node.js, Express, Mongoose, JWT, bcrypt.
- Database: MongoDB.
- Documents and email: PDFKit and Nodemailer.
- Tooling: npm, concurrently, nodemon, ESLint.

## Project Structure

```text
.
+-- client/                 # React/Vite frontend
|   +-- src/
|   |   +-- components/     # Layout, sidebar, topbar, route guards
|   |   +-- context/        # Auth and theme state
|   |   +-- pages/          # Dashboard and workflow screens
|   |   +-- services/api.js # Axios API client
|   +-- package.json
+-- server/                 # Express API
|   +-- controllers/        # Route handlers and business workflow logic
|   +-- middleware/         # JWT auth and role authorization
|   +-- models/             # Mongoose schemas
|   +-- routes/             # REST route definitions
|   +-- utils/              # Seed data, logging, notifications, PDF, email
|   +-- package.json
+-- package.json            # Root scripts for install, dev, and seed
+-- README.md
```

## Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB running locally, or a MongoDB Atlas connection string.

The client currently calls the API at `http://localhost:5000/api` from `client/src/services/api.js`, so the backend should run on port `5000` unless you update that file.

## Environment Variables

Create `server/.env` before running the API:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vendorbridge
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d

# Optional, required only for invoice email sending
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

Notes:

- `MONGO_URI` and `JWT_SECRET` are required for normal login and API usage.
- `JWT_EXPIRES_IN` is recommended; for example `7d`, `24h`, or `30d`.
- SMTP variables are only needed for the invoice email action. PDF download does not require SMTP.

## Quick Start

Install all root, server, and client dependencies:

```bash
npm run install:all
```

Seed the database with demo users and procurement data:

```bash
npm run seed
```

Start the API and frontend together from the repository root:

```bash
npm run dev
```

Open the Vite app at:

```text
http://localhost:5173
```

The API health endpoint is:

```text
http://localhost:5000/api/health
```

## Running Apps Separately

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

## Available Scripts

From the repository root:

```bash
npm run install:all  # install root, server, and client dependencies
npm run dev          # run server and client with concurrently
npm run server       # run only the Express API
npm run client       # run only the Vite client
npm run seed         # reset and seed MongoDB demo data
```

From `client/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

From `server/`:

```bash
npm run dev
npm start
npm run seed
```

## Demo Accounts

After running `npm run seed`, all seeded users use this password:

```text
password123
```

| Role | Email |
| --- | --- |
| Admin | `admin@vendorbridge.com` |
| Procurement Officer | `arjun@vendorbridge.com` |
| Procurement Officer | `neha@vendorbridge.com` |
| Manager | `priya@vendorbridge.com` |
| Vendor - TechCore Ltd | `ravi@vendorbridge.com` |
| Vendor - Infra Supplies | `deepak@vendorbridge.com` |
| Vendor - CloudNet Systems | `sanjay@vendorbridge.com` |
| Vendor - BuildRight Materials | `rohan@vendorbridge.com` |

Important: `npm run seed` deletes existing users, vendors, RFQs, quotations, approvals, purchase orders, invoices, and activity logs before inserting demo data.

## Roles and Access

| Role | Main capabilities |
| --- | --- |
| Admin | Manage users, vendors, RFQs, quotation comparison, approvals, POs, invoices, reports, and activity logs. |
| Procurement Officer | Manage vendors, create/send RFQs, compare quotations, request approvals, and manage procurement documents. |
| Manager | Review approvals, approve or reject quotation selections, and view reports. |
| Vendor | View assigned RFQs, submit quotations, and view their own purchase orders and invoices. |

## Procurement Workflow

1. Admin or Procurement Officer creates an RFQ with category, deadline, assigned vendors, and line items.
2. The RFQ is sent to assigned vendors, changing its status to `Sent` and creating vendor notifications.
3. A vendor submits a quotation. The API calculates the total amount and moves the RFQ to `Under Review`.
4. An internal user compares quotations for the RFQ and requests approval for the selected quotation.
5. A Manager approves or rejects the approval request.
6. If approved, the selected quotation becomes `Selected`, the RFQ becomes `Approved`, and the API automatically creates a purchase order plus a draft invoice using 18% GST.
7. Internal users can manage invoices, download invoice PDFs, and email invoices when SMTP settings are configured.

## API Overview

All endpoints except registration, login, and health checks require a JWT bearer token.

| Area | Base path | Notes |
| --- | --- | --- |
| Auth | `/api/auth` | Register, login, current user, admin-only user listing. |
| Vendors | `/api/vendors` | Vendor list, search, create, update, delete. |
| RFQs | `/api/rfqs` | RFQ list/detail/create/update/send. Vendor users only see assigned RFQs. |
| Quotations | `/api/quotations` | Quotation list/detail/create/update and RFQ comparison. |
| Approvals | `/api/approvals` | Approval list, request approval, manager/admin decision. |
| Purchase Orders | `/api/purchase-orders` | PO list/detail/create/update. Vendors see their own POs. |
| Invoices | `/api/invoices` | Invoice list/detail/create/update, PDF download, email sending. |
| Reports | `/api/reports` | Summary, spend by category, top vendors, monthly trend. |
| Activity Logs | `/api/activity-logs` | Audit trail. |
| Notifications | `/api/notifications` | User notifications and read state. |

## Data Model Summary

- `User`: login identity, role, active flag, optional linked vendor profile.
- `Vendor`: supplier profile, GST number, category, country, active/inactive status.
- `RFQ`: procurement request, category, status, assigned vendors, and line items.
- `Quotation`: vendor bid for an RFQ with item prices, total amount, delivery days, and status.
- `Approval`: manager decision record for a selected quotation.
- `PurchaseOrder`: generated procurement document based on an approved quotation.
- `Invoice`: generated invoice tied to a purchase order.
- `Notification`: in-app notification for workflow events.
- `ActivityLog`: audit record for important actions.

## Verification

Useful checks during development:

```bash
cd client
npm run lint
npm run build
```

The server does not currently define automated tests or a lint script. For API smoke testing, start the backend and call:

```text
GET http://localhost:5000/api/health
```

## Troubleshooting

- MongoDB connection errors usually mean `MONGO_URI` is missing, incorrect, or MongoDB is not running.
- Login/token errors usually mean `JWT_SECRET` is missing or the database has not been seeded.
- Client API errors usually mean the backend is not running on `http://localhost:5000`.
- Invoice email failures usually mean SMTP variables are missing or invalid. The API returns an email-specific error for that action.
- If seeded demo data is missing, rerun `npm run seed`; this resets the demo database collections.

## License

This project is open-source and intended for evaluation, demonstration, and hackathon-style development.
