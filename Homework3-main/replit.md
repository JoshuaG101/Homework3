# Supermarket Data Mining Application

## Overview

An interactive web application for demonstrating association rule mining in a supermarket context. Users can simulate shopping transactions, view historical transaction data, and run the Apriori algorithm to discover purchasing patterns and association rules. The application provides an educational interface for understanding data mining concepts through real-world retail scenarios.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component Library**: shadcn/ui components built on Radix UI primitives
- Design system follows Material Design 3 principles with Roboto font family
- Custom Tailwind configuration with extended color system using CSS variables
- New York style variant for shadcn components
- Responsive design with mobile-first approach

**State Management**:
- TanStack Query (React Query) for server state management with custom query client configuration
- Local React state for component-level state (shopping cart, form inputs)
- Stale-while-revalidate pattern with infinite stale time for static data

**Routing**: wouter for lightweight client-side routing
- Four main routes: Shop, Transactions, Mining Results, Settings
- Tab-based navigation with persistent state

**Key Pages**:
1. **Shop** (`/`): Product browsing and cart management for creating transactions
2. **Transactions** (`/transactions`): Transaction history with CSV import functionality
3. **Mining Results** (`/results`): Display of frequent itemsets and association rules
4. **Settings** (`/settings`): Apriori algorithm configuration (min support, min confidence)

### Backend Architecture

**Server Framework**: Express.js with TypeScript (ES modules)

**Architecture Pattern**: In-memory storage with interface-based design
- `IStorage` interface defines storage contract
- `MemStorage` implementation provides runtime data persistence
- Pre-initialized with default product catalog (dairy, bakery, snacks, meat, produce)

**API Endpoints**:
- `GET /api/products` - Retrieve product catalog
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create single transaction
- `POST /api/transactions/import` - Bulk import from CSV
- `GET /api/transactions/stats` - Transaction statistics
- `POST /api/mining/run` - Execute Apriori algorithm with configuration
- `GET /api/mining/results` - Retrieve last mining results

**Apriori Algorithm Implementation**:
- Custom TypeScript implementation of the Apriori algorithm
- Generates frequent itemsets and association rules
- Configurable minimum support and confidence thresholds
- Calculates support, confidence, and lift metrics
- Results stored in-memory between requests

**Data Flow**:
1. User creates transactions via shop interface or CSV import
2. Transactions stored in memory with product IDs as items
3. Mining algorithm processes transaction history on-demand
4. Results cached and served to frontend for visualization

### Development Tools

**Build System**: 
- Vite for frontend with React plugin and runtime error overlay
- esbuild for server-side bundling in production
- TypeScript compilation with strict mode enabled

**Database Tooling**:
- Drizzle ORM configured for PostgreSQL
- Schema defined in `shared/schema.ts` but currently unused (in-memory storage active)
- Migration setup ready via `drizzle-kit push`

**Path Aliases**:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### Type Safety

**Shared Schema**: Zod validation schemas derived from Drizzle table definitions
- Product schema with ID, name, category, price
- Transaction schema with ID, items array, timestamp
- Mining configuration and result types
- Type inference ensures frontend/backend consistency

**Validation Strategy**:
- Runtime validation on API endpoints using Zod schemas
- TypeScript compile-time type checking across full stack
- Shared types between client and server prevent drift

## External Dependencies

### Database (Configured but Inactive)

**PostgreSQL via Neon Database**:
- Serverless driver: `@neondatabase/serverless`
- ORM: Drizzle with schema-first approach
- Connection string expected in `DATABASE_URL` environment variable
- Note: Application currently uses in-memory storage; database integration requires migration

### UI Component Libraries

**Radix UI**: Headless component primitives for accessibility
- 20+ components: Dialog, Dropdown, Select, Tabs, Toast, etc.
- Keyboard navigation and ARIA attributes built-in
- Used as foundation for shadcn/ui components

**Additional UI Libraries**:
- `cmdk`: Command palette component
- `embla-carousel-react`: Carousel functionality
- `class-variance-authority`: Component variant management
- `lucide-react`: Icon library
- `date-fns`: Date formatting utilities

### Form Management

**React Hook Form**:
- `react-hook-form`: Form state and validation
- `@hookform/resolvers`: Zod schema integration
- Used in Settings page for mining configuration

### Styling

**Tailwind CSS**: Utility-first CSS framework
- PostCSS with Autoprefixer for vendor prefixes
- Custom design tokens in CSS variables
- Extended configuration for Material Design 3 alignment

**Fonts**: Google Fonts CDN
- Roboto (weights: 300, 400, 500, 700)
- Roboto Mono (weights: 400, 500)
- Material Icons font

### Development Dependencies

**Replit Integrations**:
- `@replit/vite-plugin-runtime-error-modal`: Error overlay
- `@replit/vite-plugin-cartographer`: Code exploration
- `@replit/vite-plugin-dev-banner`: Development indicators

### Session Management

**connect-pg-simple**: PostgreSQL session store for Express
- Currently configured but may not be actively used
- Prepared for session-based authentication if needed