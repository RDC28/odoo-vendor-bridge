# VendorBridge: Full-Stack Enterprise Procurement ERP

VendorBridge is a comprehensive, full-stack Enterprise Resource Planning (ERP) application designed specifically to streamline and automate corporate procurement. It handles everything from Request for Quotation (RFQ) creation to automated Purchase Order and Invoice generation.

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Distinct workflows for Admins, Procurement Officers, Managers, and external Vendors.
*   **RFQ Management:** Multi-step wizard to create and publish RFQs, with automated category-based vendor assignment.
*   **Quotation Sourcing & Comparison:** Vendors can easily submit quotes. Officers get a side-by-side comparison table to easily identify the most cost-effective bids.
*   **Approval Workflows:** Multi-stage approval processes requiring managerial sign-off before financial commitment.
*   **Automated Document Generation:** Instant, automatic creation of Purchase Orders (POs) and Invoices upon managerial approval.
*   **PDF Exports & Emailing:** Generate clean PDF documents and email them directly to vendors.
*   **Activity Logging:** Complete audit trails tracking every system action.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, TailwindCSS, React Router, Lucide Icons.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB & Mongoose.
*   **Authentication:** JSON Web Tokens (JWT).
*   **Document Processing:** PDFKit, Nodemailer.

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
*   [Node.js](https://nodejs.org/en) installed.
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure your `server/.env` file exists and contains your MongoDB URI and JWT secret.
4. Start the backend server (we highly recommend running `npm run dev` to auto-reload on file changes):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

---

## 🎭 Default Roles & Workflow Testing

To properly test the full functionality of the application, follow this end-to-end procurement cycle:

### Step 1: Registration (Vendor/Admin)
*   **Vendors** can self-register using the "Register as Vendor" link on the login page.
*   An **Admin** user can be created to manage internal users (Procurement Officers and Managers) through the Users dashboard.

### Step 2: Create an RFQ (Procurement Officer)
*   Log in as a **Procurement Officer**.
*   Navigate to **RFQs** and click "Create New RFQ".
*   Add items and select a category. The system will automatically assign matching active vendors.

### Step 3: Submit a Quote (Vendor)
*   Log out and log in as one of the assigned **Vendors**.
*   Navigate to **Quotations**, find the open RFQ, and submit your pricing and delivery details.

### Step 4: Compare & Select (Procurement Officer)
*   Log back in as the **Procurement Officer**.
*   Go to **Quotations** and click "Compare Quotes" on the RFQ.
*   Review the side-by-side bids and click **Select Vendor** on the winning bid. This automatically triggers an Approval Request.

### Step 5: Approve & Generate (Manager)
*   Log out and log in as a **Manager**.
*   Navigate to the **Approvals** tab and review the Officer's request.
*   Click **Approve & Generate PO**. 
*   **Magic:** The system will immediately update the RFQ status, generate a binding **Purchase Order**, and draft an **Invoice**!

### Step 6: Documentation (Anyone)
*   Navigate to the **Purchase Orders** and **Invoices** tabs to view the auto-generated documents.
*   Download PDFs or trigger automated emails.

---

## 📄 License
This project is open-source and created for evaluation and demonstration purposes.
