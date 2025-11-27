# Development Plan - Airtime & Data Vending Platform Frontend

## 📋 Project Overview

**Technology Stack:**
- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Prisma (read-only)
- React Query
- Zod + React Hook Form
- Axios

**Key Principles:**
- Prisma for server-side reads only
- All writes through API routes
- React Query for client-side mutations
- Role-based access control (Admin/Merchant)
- Type-safe throughout

---

## 🎯 Development Phases

### Phase 1: Foundation & Setup
**Priority: CRITICAL**

#### 1.1 Project Infrastructure
- [ ] Verify Prisma schema exists and run `prisma db pull`
- [ ] Set up Prisma client configuration
- [ ] Configure React Query provider
- [ ] Set up Axios instance with interceptors
- [ ] Create API response type definitions
- [ ] Set up environment variables structure
- [ ] Configure TypeScript paths (if needed)

#### 1.2 Core Utilities & Helpers
- [ ] Create API client utilities (`lib/api-client.ts`)
- [ ] Create error handling utilities
- [ ] Create date formatting utilities
- [ ] Create currency formatting utilities
- [ ] Create role/permission utilities
- [ ] Create form validation schemas (Zod) structure

#### 1.3 Base UI Components (shadcn/ui)
- [ ] Install and configure shadcn/ui
- [ ] Set up base components: Button, Input, Card, Table, Dialog, Select, etc.
- [ ] Create custom layout components (Sidebar, Header, Footer)
- [ ] Create loading states (Skeleton, Spinner)
- [ ] Create error states (ErrorBoundary, ErrorMessage)

#### 1.4 Authentication System
- [ ] Create login page (`app/(auth)/login/page.tsx`)
- [ ] Create login form component with validation
- [ ] Set up session management (cookies/localStorage)
- [ ] Create auth context/provider
- [ ] Create protected route middleware
- [ ] Create role-based route guards
- [ ] Create logout functionality

---

### Phase 2: Admin Dashboard & Core Features
**Priority: HIGH**

#### 2.1 Admin Layout & Navigation
- [ ] Create admin layout (`app/(admin)/layout.tsx`)
- [ ] Create admin sidebar navigation
- [ ] Create admin header with user menu
- [ ] Set up admin route structure
- [ ] Create breadcrumb component

#### 2.2 Admin Dashboard
- [ ] Create dashboard page (`app/(admin)/dashboard/page.tsx`)
- [ ] Create KPI cards component:
  - Total merchants
  - Daily transactions
  - Transaction volume
  - Failure rate
  - Provider health status
- [ ] Create activity graphs (daily/weekly)
- [ ] Create recent transactions widget
- [ ] Integrate with API for real-time data

#### 2.3 Merchant Management
- [ ] Create merchants list page (`app/(admin)/merchants/page.tsx`)
  - [ ] Table with pagination
  - [ ] Search/filter functionality
  - [ ] Status badges
- [ ] Create merchant form component (`app/(admin)/merchants/_components/MerchantForm.tsx`)
  - [ ] Form fields with Zod validation
  - [ ] React Hook Form integration
  - [ ] Submit handler with React Query mutation
- [ ] Create merchant detail page (`app/(admin)/merchants/[id]/page.tsx`)
  - [ ] Merchant info display
  - [ ] Wallet balance
  - [ ] Transactions tab
  - [ ] Funding history tab
  - [ ] Merchant users management
- [ ] Create API route handlers (`app/api/merchants/route.ts`)

#### 2.4 Provider Configuration
- [ ] Create providers list page (`app/(admin)/providers/page.tsx`)
- [ ] Create provider accounts management
- [ ] Create provider account form:
  - [ ] Auth type selector (API key, OAuth, SOAP)
  - [ ] Config JSON editor
  - [ ] Enable/Disable toggle
- [ ] Create provider health/status view
- [ ] Create API route handlers (`app/api/providers/route.ts`)

---

### Phase 3: Product & Data Management
**Priority: HIGH**

#### 3.1 Product Management
- [ ] Create products list page (`app/(admin)/products/page.tsx`)
- [ ] Create product form component:
  - [ ] Name, code, product type fields
  - [ ] Face value, cost price
  - [ ] Preferred provider selector
  - [ ] Backup provider selector
  - [ ] Param schema JSON editor
- [ ] Create product detail/edit page
- [ ] Create API route handlers (`app/api/products/route.ts`)

#### 3.2 Data Package Upload
- [ ] Create data package upload page (`app/(admin)/products/data-upload/page.tsx`)
- [ ] Create file upload component (CSV/JSON)
- [ ] Create preview component with field mapping
- [ ] Create bulk import handler
- [ ] Create validation for uploaded data
- [ ] Create API route handler (`app/api/products/data-packages/route.ts`)

#### 3.3 Discount Management
- [ ] Create discounts list page (`app/(admin)/discounts/page.tsx`)
- [ ] Create discount form:
  - [ ] Product selector
  - [ ] Merchant selector (or global)
  - [ ] Discount type (percentage/flat)
  - [ ] Discount value
- [ ] Create API route handlers (`app/api/discounts/route.ts`)

---

### Phase 4: Transactions & Funding
**Priority: HIGH**

#### 4.1 Transaction Management (Admin)
- [ ] Create transactions list page (`app/(admin)/transactions/page.tsx`)
  - [ ] Server-side filtering:
    - Status filter
    - Merchant filter
    - Provider filter
    - Date range picker
    - Reference search
  - [ ] Pagination
  - [ ] Export to CSV
- [ ] Create transaction detail modal/page:
  - [ ] Provider account used
  - [ ] Telco reference
  - [ ] Extra params display
  - [ ] Requery status
  - [ ] Requery button
- [ ] Create requery API handler (`app/api/transactions/[id]/requery/route.ts`)
- [ ] Create API route handlers (`app/api/transactions/route.ts`)

#### 4.2 Funding Management
- [ ] Create funding page (`app/(admin)/funding/page.tsx`)
- [ ] Create fund merchant form:
  - [ ] Merchant selector
  - [ ] Amount input
  - [ ] Notes/description
  - [ ] Show before/after balance
- [ ] Create funding history list
- [ ] Create API route handlers (`app/api/funding/route.ts`)

---

### Phase 5: User Management & Reports
**Priority: MEDIUM**

#### 5.1 User Management
- [ ] Create users list page (`app/(admin)/users/page.tsx`)
- [ ] Create user form:
  - [ ] User details (name, email, etc.)
  - [ ] Role selector (superadmin, admin, merchant_user)
  - [ ] Merchant assignment (for merchant_user)
- [ ] Create user detail/edit page
- [ ] Create API route handlers (`app/api/users/route.ts`)

#### 5.2 Reports (Admin)
- [ ] Create reports page (`app/(admin)/reports/page.tsx`)
- [ ] Create report filters:
  - [ ] Date range
  - [ ] Merchant selection
  - [ ] Report type (daily/monthly)
- [ ] Create report generation handler
- [ ] Create CSV export functionality
- [ ] Create PDF export functionality (optional)
- [ ] Create API route handlers (`app/api/reports/route.ts`)

---

### Phase 6: Merchant Portal
**Priority: HIGH**

#### 6.1 Merchant Layout & Navigation
- [ ] Create merchant layout (`app/(merchant)/layout.tsx`)
- [ ] Create merchant sidebar navigation
- [ ] Create merchant header
- [ ] Set up merchant route structure
- [ ] Ensure role-based access (merchant can only see own data)

#### 6.2 Merchant Dashboard
- [ ] Create merchant dashboard page (`app/(merchant)/dashboard/page.tsx`)
- [ ] Create wallet balance display
- [ ] Create latest transactions widget
- [ ] Create quick filters (failed, pending)
- [ ] Create activity summary

#### 6.3 Merchant Transactions
- [ ] Create merchant transactions page (`app/(merchant)/transactions/page.tsx`)
  - [ ] Filter by date, product, status
  - [ ] Merchant-only data (filtered by merchant_id from session)
  - [ ] Export to CSV
- [ ] Create transaction detail view

#### 6.4 Merchant Funding History
- [ ] Create funding history page (`app/(merchant)/funding/page.tsx`)
- [ ] Display merchant's funding events only
- [ ] Show funding details (amount, date, admin who funded)

#### 6.5 Merchant Reports
- [ ] Create merchant reports page (`app/(merchant)/reports/page.tsx`)
- [ ] Generate merchant-level activity reports
- [ ] Export functionality

---

### Phase 7: Polish & Testing
**Priority: MEDIUM**

#### 7.1 UI/UX Polish
- [ ] Responsive design review (mobile, tablet, desktop)
- [ ] Loading states for all async operations
- [ ] Error handling and user-friendly error messages
- [ ] Success notifications/toasts
- [ ] Form validation feedback
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

#### 7.2 Testing
- [ ] Form validation tests (Zod schemas)
- [ ] Navigation tests
- [ ] Integration tests:
  - [ ] Creating merchant
  - [ ] Funding merchant
  - [ ] Configuring provider
  - [ ] Uploading data package
  - [ ] Creating product
  - [ ] Viewing transactions
  - [ ] Requery functionality

#### 7.3 Performance Optimization
- [ ] Code splitting
- [ ] Image optimization
- [ ] API response caching strategies
- [ ] React Query cache configuration

---

## 📁 Detailed Folder Structure

```
app/
├── (auth)/
│   └── login/
│       ├── page.tsx
│       └── _components/
│           └── LoginForm.tsx
│
├── (admin)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── KPICards.tsx
│   │       ├── ActivityChart.tsx
│   │       └── RecentTransactions.tsx
│   │
│   ├── merchants/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── MerchantDetails.tsx
│   │   │       ├── MerchantTransactions.tsx
│   │   │       └── MerchantFunding.tsx
│   │   └── _components/
│   │       ├── MerchantList.tsx
│   │       └── MerchantForm.tsx
│   │
│   ├── providers/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── ProviderList.tsx
│   │       ├── ProviderAccountForm.tsx
│   │       └── ProviderHealth.tsx
│   │
│   ├── products/
│   │   ├── page.tsx
│   │   ├── data-upload/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── DataUploadForm.tsx
│   │   │       └── DataPreview.tsx
│   │   └── _components/
│   │       ├── ProductList.tsx
│   │       └── ProductForm.tsx
│   │
│   ├── discounts/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── DiscountList.tsx
│   │       └── DiscountForm.tsx
│   │
│   ├── transactions/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── TransactionList.tsx
│   │       ├── TransactionFilters.tsx
│   │       └── TransactionDetail.tsx
│   │
│   ├── funding/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── FundMerchantForm.tsx
│   │       └── FundingHistory.tsx
│   │
│   ├── users/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── UserList.tsx
│   │       └── UserForm.tsx
│   │
│   └── reports/
│       ├── page.tsx
│       └── _components/
│           ├── ReportFilters.tsx
│           └── ReportViewer.tsx
│
├── (merchant)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── WalletBalance.tsx
│   │       └── RecentTransactions.tsx
│   │
│   ├── transactions/
│   │   ├── page.tsx
│   │   └── _components/
│   │       └── MerchantTransactionList.tsx
│   │
│   ├── funding/
│   │   ├── page.tsx
│   │   └── _components/
│   │       └── MerchantFundingHistory.tsx
│   │
│   └── reports/
│       ├── page.tsx
│       └── _components/
│           └── MerchantReportViewer.tsx
│
└── api/
    ├── auth/
    │   └── login/
    │       └── route.ts
    │
    ├── merchants/
    │   ├── route.ts
    │   └── [id]/
    │       └── route.ts
    │
    ├── providers/
    │   ├── route.ts
    │   └── [id]/
    │       └── route.ts
    │
    ├── products/
    │   ├── route.ts
    │   ├── [id]/
    │   │   └── route.ts
    │   └── data-packages/
    │       └── route.ts
    │
    ├── discounts/
    │   └── route.ts
    │
    ├── transactions/
    │   ├── route.ts
    │   └── [id]/
    │       ├── route.ts
    │       └── requery/
    │           └── route.ts
    │
    ├── funding/
    │   └── route.ts
    │
    ├── users/
    │   └── route.ts
    │
    └── reports/
        └── route.ts

components/
└── ui/
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    ├── table.tsx
    ├── dialog.tsx
    ├── select.tsx
    ├── form.tsx
    └── ... (other shadcn components)

lib/
├── api-client.ts          # Axios instance & interceptors
├── prisma.ts              # Prisma client
├── utils.ts               # Utility functions
├── validations/           # Zod schemas
│   ├── merchant.ts
│   ├── product.ts
│   ├── provider.ts
│   └── ...
└── hooks/                 # Custom React hooks
    ├── useAuth.ts
    └── usePermissions.ts
```

---

## 🔧 Technical Implementation Details

### API Response Format
```typescript
// Success response
{
  success: true,
  data: { ... }
}

// Error response
{
  success: false,
  error: "Error message here"
}
```

### React Query Mutations
Use React Query for:
- Creating merchants
- Funding wallets
- Changing provider configs
- Creating products
- Uploading data packages
- Assigning discounts
- Requerying transactions

### Prisma Usage Rules
- ✅ Use in server components (page.tsx, layout.tsx)
- ✅ Use in API routes
- ❌ Never use in client components
- ❌ Never push/migrate schema (read-only)

### Authentication Flow
1. User submits login form
2. API route validates credentials
3. Set session cookie/token
4. Redirect based on role (admin/merchant)
5. Protected routes check session
6. Role-based UI rendering

### Role-Based Access Control
- Admin routes: `/admin/*` or `/(admin)/*`
- Merchant routes: `/merchant/*` or `/(merchant)/*`
- Middleware checks role before rendering
- API routes validate role for operations

---

## ✅ Definition of Done

Each feature is considered complete when:
- [ ] UI component is built and styled
- [ ] Form validation is implemented (Zod)
- [ ] API integration is complete
- [ ] Error handling is in place
- [ ] Loading states are shown
- [ ] Success feedback is provided
- [ ] Responsive design is verified
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Code follows project conventions

---

## 📝 Notes

- Backend API endpoints are assumed to exist
- Database schema is already created
- Focus on frontend UI/UX only
- All database writes go through API routes
- Use server components where possible for performance
- Use client components only when needed (forms, interactions)

---

## 🚀 Quick Start Checklist

Before starting development:
1. [ ] Verify Prisma schema is pulled
2. [ ] Install all dependencies
3. [ ] Set up environment variables
4. [ ] Configure API base URL
5. [ ] Test API connectivity
6. [ ] Set up shadcn/ui components
7. [ ] Create base layout structure

---

**Last Updated:** [Date]
**Status:** Planning Phase

