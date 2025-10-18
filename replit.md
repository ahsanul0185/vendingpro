# VendingPro Dashboard

## Overview

VendingPro is a comprehensive vending machine management system designed for real-time monitoring, inventory control, order tracking, and maintenance management across a network of vending machines. It features a modern, responsive dashboard to enable operators to manage products, sales, deliveries, assemblies, and maintenance efficiently. The system supports secure user authentication, role-based access control (admin and customer), and a real-time notification system.

Key capabilities include:
- Secure user authentication and password management.
- Role-based access control for administrative and customer functionalities.
- Real-time notifications and dedicated notifications page.
- Management of product inventory, pricing, and categories (admin only).
- Tracking of sales orders, transactions, and order statuses.
- Scheduling and tracking of deliveries, machine assembly tasks, and maintenance activities (admin only).
- Customer-specific dashboards displaying personal order statistics.
- Dynamic order count badges in the navigation for both admin and customer roles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

**Design Decisions:**
- Component-based architecture with feature-based organization.
- Glass-morphism design aesthetic with gradient accents.
- Responsive design for mobile, tablet, and desktop.
- Shared UI components in `/client/src/components/ui`.
- Path aliases configured for better code organization.
- Role-based navigation filtering and protected routes with dynamic badge counts.
- Card/list view toggle for data visualization.

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Authentication**: Passport.js with `passport-local`
- **Session Management**: `express-session` with `connect-pg-simple`
- **Password Hashing**: Node.js scrypt
- **Database ORM**: Drizzle ORM
- **Validation**: Zod schemas (shared)
- **Development**: tsx

**API Structure:**
- RESTful endpoints organized by resource type.
- Centralized authentication, password management, and notification routes.
- Role-based authorization middleware.
- Storage layer abstraction for database operations.
- Centralized error handling and logging.

**Key Design Patterns:**
- Repository pattern for data access.
- Schema-first design with Drizzle schemas.
- Shared validation schemas between frontend and backend using Zod.
- Type-safe database operations with Drizzle ORM.

### Data Storage

**Database**: PostgreSQL (via Neon serverless)

**Schema Design:**
- **users**: Authentication, user management, and role-based access.
- **products**: Product catalog with categories, pricing, stock.
- **machines**: Vending machine inventory.
- **orders**: Transaction records and order items.
- **order_items**: Line items for orders.
- **deliveries**: Delivery scheduling and tracking.
- **assemblies**: Assembly task management.
- **maintenance_records**: Maintenance scheduling and history.

**Schema Features:**
- UUID primary keys.
- Timestamp tracking (`created_at`, `updated_at`).
- JSONB fields for flexible data.
- Status enums for workflow management.
- Decimal precision for monetary values.

### Authentication & Authorization

**Authentication System:**
- Session-based authentication using Passport.js.
- Secure password storage with scrypt hashing.
- Sessions stored in PostgreSQL.
- Protected routes and Auth context provider.

**Role-Based Access Control (RBAC):**
- Two roles: `admin` and `customer`.
- Frontend route protection with `allowedRoles` parameter.
- Backend authorization filtering.

**Security Features:**
- Backend order filtering to ensure data privacy.
- Role-based route guards.
- Automatic redirect for unauthorized access.
- Secure cookie settings for session management.
- Password reset functionality.

## External Dependencies

**Database Services:**
- **Neon Serverless PostgreSQL**: Primary database.
- **Drizzle Kit**: Database migrations and schema management.

**UI Component Libraries:**
- **Radix UI**: Unstyled, accessible component primitives.
- **shadcn/ui**: Pre-built components based on Radix UI.
- **Tailwind CSS**: Utility-first CSS framework.

**Development Tools:**
- **Vite**: Build tool and dev server.

**Validation & Forms:**
- **Zod**: Schema validation.
- **React Hook Form**: Form state management.
- **@hookform/resolvers**: Integration for Zod with React Hook Form.

**Data Fetching:**
- **TanStack Query**: Server state management.

**Utilities:**
- **date-fns**: Date manipulation.
- **clsx & tailwind-merge**: Conditional className composition.
- **class-variance-authority**: Type-safe variant styling.
- **embla-carousel**: Carousel functionality.
- **cmdk**: Command menu implementation.