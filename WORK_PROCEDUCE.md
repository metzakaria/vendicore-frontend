Project Description — Airtime & Data Vending Platform (Frontend)

This project is a web-based Admin & Merchant Portal for managing an Airtime and Data Vending Platform. The frontend will be built using Next.js App Router, TypeScript, TailwindCSS, shadcn/ui, and Prisma (reading from an already-created database schema).

The platform supports two main user roles:

👤 User Roles
1. Superadmin/Admin

This role manages everything on the platform:

Create and manage merchants

Configure providers and their accounts

Create and manage products (airtime/data/TV/power/etc.)

Upload data bundles (CSV/JSON)

Configure discounts per merchant or product

Fund merchant wallets

View and manage all transactions

Perform requery on transactions

Manage users (admin, merchant users)

Generate system-wide reports

2. Merchant

This role can access their own data only:

View their dashboard (wallet, recent transactions)

View transaction history

View wallet funding history

Generate merchant-level reports

🏗️ System Overview

The backend provides:

A database already created with tables such as:
Merchant, MerchantFund, Provider, ProviderAccount, Product, ProductCategory, ProductDiscount, ProductDataPackage, Transaction, Users, Roles

API endpoints for:
CRUD operations, transactions, requery, funding, provider configuration, product management, login/auth

Prisma is set up to pull the database schema, not push or migrate.

The frontend will:

Use Prisma ONLY to read the database (or access through server-side API routes)

Use API routes for actions (create/update/delete)

Use react-query for client-side data mutations and cache

🖥️ Technology Stack (Frontend)

Next.js (App Router) — main framework

TypeScript — for type safety

TailwindCSS — for styling

shadcn/ui — for UI components

Prisma — database access layer (DB schema already exists)

React Query — data fetching and state synchronization

Zod + React Hook Form — forms and validation

Axios — API client

🧩 Major Features To Implement
🔐 Authentication

Admin/Superadmin login

Merchant login

Session persistence

Role-based UI access (superadmin routes vs merchant routes)

🧭 Superadmin/Admin Features
1. Dashboard

Show KPIs: total merchants, daily transactions, volume, failures, provider health

Graphs for daily/weekly activity

2. Merchant Management

List merchants with pagination

Create merchant (form)

View merchant details:
→ Transactions
→ Funding history
→ Wallet balance

Manage merchant users

3. Provider Configuration

List all providers (MTN, Airtel, etc.)

Manage Provider Accounts (multiple per provider)

Auth type (API key, OAuth, SOAP, etc.)

Config JSON (API endpoint, credentials ref)

Enable/Disable provider account

Provider health/status view

4. Product Management

List products (airtime, data plans, TV, etc.)

Create product

Fields include: name, code, product type, face_value, cost_price

Select:

preferred_provider

backup_provider

Param schema editor (JSON) for required vending params

5. Data Package Upload

Upload CSV/JSON of data plans

Preview + map fields

Bulk import

6. Discount Management

Create product discount per merchant or global

Percentage or flat discounts

7. Funding

Fund merchant wallets

Show funding history

Show before/after balances

8. Transactions

Full transaction list with server-side filters:
status, merchant, provider, date range, reference

Transaction details:

provider account used

telco reference

extra params

requery status

Requery button

9. Users

Create and manage system users (superadmin, admin, merchant_user)

Assign merchants to users

10. Reports

Generate daily/monthly merchant & system reports

Export CSV/PDF

🧭 Merchant Features
1. Dashboard

Wallet balance

Latest transactions

Quick filters (failed, pending)

2. Transactions

List merchant-only transactions

Filter by date, product, status

Export to CSV

3. Funding

List funding events for merchant wallet

4. Reports

Generate merchant-level activity reports

📂 Recommended Folder Structure
app/
   #each folder will content it _components and _actions the 
api/
 
components/
  ui/               # global component should only shadcn components and common layouts
 
lib/
 


🔌 API / DB Interaction Rules

Prisma can be used server-side in page.tsx, layout.tsx, or API routes.

Database reads can happen directly in server components.

Database writes MUST go through an API route (for auth + access control).

Cursor should automatically infer DB tables from Prisma schema (prisma db pull).

React Query is used for client-side mutations:

create merchant

fund wallet

change provider

create product

upload data package

assign discounts

API responses should be shaped like:

{ "success": true, "data": {...} }
{ "success": false, "error": "Reason here" }

🧪 Testing Requirements

UI form validation (zod)

Navigation tests

Frontend integration tests for:

creating merchant

funding merchant

configuring provider

uploading data package

creating product

viewing transactions

📦 Deliverables Cursor Must Build

Fully functional frontend with Admin & Merchant dashboards

All CRUD screens

All forms with validation

Fully styled Tailwind + shadcn UI

Role-aware layouts and navigation

Provider & product configuration interfaces

Data upload tools

Transaction viewer with requery button

Report generation (CSV export)

Responsive design (mobile-friendly)

Type-safe Prisma model queries

✅ Final Notes for Cursor

Backend logic (vending, wallet operations, provider APIs) is already implemented elsewhere.

Cursor should focus exclusively on:

UI components

Page routes

Forms & validation

Prisma reading

API route wrappers

Admin/Merchant dashboards

Cursor should not create or modify database schemas — only read them via Prisma.