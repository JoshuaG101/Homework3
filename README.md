# Supermarket Association Rule Mining Application

## Project Overview

This is an interactive web application designed for demonstrating association rule mining algorithms in a supermarket context. The application allows users to simulate shopping transactions, view historical transaction data, and run the **Apriori algorithm** to discover purchasing patterns and association rules. Built as an educational tool, it provides a practical interface for understanding data mining concepts through real-world retail scenarios.

### Key Features

- **Interactive Shopping Interface**: Browse products and create transactions through an intuitive shopping cart system
- **Transaction Management**: View transaction history, import CSV files, and analyze transaction statistics
- **Association Rule Mining**: Execute the Apriori algorithm with configurable parameters to discover frequent itemsets and association rules
- **Results Visualization**: Display discovered patterns with support, confidence, and lift metrics in an organized, easy-to-understand format
- **Real-time Statistics**: Track total transactions, unique items, average basket size, and most frequent items

### Technology Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js + Express.js, TypeScript (ES modules)
- **State Management**: TanStack Query (React Query)
- **Validation**: Zod schemas for runtime type checking
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Material Design 3 principles with Roboto font family

---

## Installation and Setup Instructions

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (comes with Node.js)

### Step-by-Step Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd Homework3-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install all required dependencies including React, Express, TypeScript, and UI component libraries.

3. **Start the development server**
   
   **Windows (PowerShell):**
   ```powershell
   $env:NODE_ENV="development"; npm run dev
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   set NODE_ENV=development && npm run dev
   ```
   
   **macOS/Linux:**
   ```bash
   npm run dev
   ```

4. **Access the application**
   
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

   The default port is 5000, but you can change it by setting the `PORT` environment variable:
   ```bash
   PORT=3000 npm run dev
   ```

### Troubleshooting

- **Port already in use**: Set a different port using the `PORT` environment variable
- **Dependencies issues**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- **TypeScript errors**: Run `npm run check` to verify TypeScript compilation

### Building for Production

To create a production build:

```bash
npm run build
npm start
```

The production build will be served from the `dist` directory.

---

## How to Use the Application

### 1. Shop Page (`/`)

**Purpose**: Create shopping transactions by adding products to your cart.

**Steps**:
1. Browse available products displayed in a grid layout
2. Click the "Add" button on any product to add it to your cart
3. Use the quantity controls (+/-) in the cart sidebar to adjust item quantities
4. Click "Complete Purchase" to finalize the transaction
5. The transaction will be saved and appear in the Transactions page

**Features**:
- Product grid with category icons
- Real-time cart updates with total calculation
- Toast notifications for user feedback

### 2. Transactions Page (`/transactions`)

**Purpose**: View transaction history and import bulk transaction data.

**Features**:
- **Transaction List**: View all transactions sorted by most recent first
  - Click on any transaction to expand and see detailed items
  - Each transaction shows ID, timestamp, and item count
- **Statistics Dashboard**: View key metrics at a glance
  - Total transactions count
  - Unique items in database
  - Average items per transaction
  - Most frequent items (top 5)
- **CSV Import**: Import transaction data from CSV files
  - Click "Upload CSV" and select a CSV file
  - Format: One transaction per line, items separated by commas
  - Example: `Milk,Bread,Eggs` (first line)
  - Example: `Coffee,Tea,Cookies` (second line)
  - Headers are automatically detected and skipped

**Use Cases**:
- Review transaction history
- Import external datasets for mining
- Analyze transaction patterns before running mining algorithms

### 3. Settings Page (`/settings`)

**Purpose**: Configure and run the Apriori association rule mining algorithm.

**Parameters**:
- **Minimum Support** (5% - 50%): The minimum frequency for itemsets to be considered frequent
  - Lower values = more itemsets discovered (slower, more results)
  - Higher values = fewer but more common itemsets (faster, fewer results)
  - Recommended: Start with 20-30% for balanced results
- **Minimum Confidence** (10% - 100%): The minimum confidence for association rules
  - Lower values = more rules generated (including weaker associations)
  - Higher values = fewer but stronger rules
  - Recommended: Start with 50-70% for meaningful patterns

**Steps to Run Mining**:
1. Adjust the sliders or input values for minimum support and confidence
2. Click "Run Association Rule Mining"
3. Wait for the algorithm to process (progress indicator shown)
4. You will be automatically redirected to the Results page upon completion

**Algorithm Information**:
The page includes educational content explaining:
- What the Apriori algorithm does
- How support, confidence, and lift metrics are calculated
- What these metrics mean in practical terms

### 4. Mining Results Page (`/results`)

**Purpose**: View and analyze discovered association rules and frequent itemsets.

**Components**:

1. **Statistics Summary**:
   - Total Rules: Number of association rules discovered
   - Average Confidence: Mean confidence across all rules
   - Processing Time: Algorithm execution time in milliseconds

2. **Association Rules Table**:
   - **Antecedent** → **Consequent**: Shows the if-then relationship
   - **Support**: Percentage of transactions containing the itemset
   - **Confidence**: Probability that consequent appears when antecedent is present
   - **Lift**: Strength of association (values > 1 indicate positive correlation)
   - Rules are sorted by confidence (highest first)

3. **Frequent Itemsets**:
   - Organized by itemset size (1-itemsets, 2-itemsets, etc.)
   - Expandable sections for each size category
   - Each itemset shows:
     - Items in the itemset
     - Support percentage
     - Transaction count

**Interpreting Results**:
- **High Support**: Common patterns across many transactions
- **High Confidence**: Strong predictive relationships
- **High Lift (>1)**: Items appear together more often than by chance
- **Lift = 1**: Items are independent
- **Lift < 1**: Items appear together less often than expected (negative correlation)

**Example Rule Interpretation**:
```
[Milk, Bread] → [Eggs]
Support: 30%, Confidence: 75%, Lift: 1.5

This means:
- 30% of transactions contain Milk, Bread, and Eggs together
- When Milk and Bread are purchased, Eggs are bought 75% of the time
- Eggs are 1.5x more likely to be purchased with Milk and Bread than alone
```

---

## Algorithm Implementation Notes

### Apriori Algorithm Overview

The Apriori algorithm is implemented in `server/apriori.ts` as a TypeScript class. It follows the classic Apriori algorithm structure with optimizations for clarity and educational purposes.

### Algorithm Steps

1. **Generate 1-Itemset Candidates**
   - Scan all transactions to count occurrences of individual items
   - Create candidate itemsets of size 1

2. **Filter Frequent Itemsets**
   - Calculate support for each candidate
   - Retain only itemsets meeting minimum support threshold

3. **Iterative Generation**
   - For k = 2, 3, 4, ...:
     - Generate k-itemset candidates from (k-1)-frequent itemsets (self-join)
     - Prune candidates whose subsets are not frequent (Apriori property)
     - Count support for remaining candidates
     - Filter frequent k-itemsets

4. **Termination**
   - Stop when no more frequent itemsets of size k can be generated

5. **Generate Association Rules**
   - For each frequent itemset with size ≥ 2:
     - Generate all non-empty subsets as antecedents
     - Calculate confidence for each rule (antecedent → consequent)
     - Retain rules meeting minimum confidence threshold
     - Calculate lift for valid rules

### Key Implementation Details

**Data Structures**:
- `ItemsetMap`: Uses Map with JSON-stringified itemsets as keys for efficient lookup
- `FrequentItemset[]`: Array of itemsets with support and count metadata
- `AssociationRule[]`: Array of rules with antecedent, consequent, support, confidence, and lift

**Optimizations**:
- **Apriori Property**: Prunes candidate itemsets if any subset is not frequent (reduces search space)
- **Efficient Counting**: Uses filter operations for support counting (optimized for small-medium datasets)
- **Early Termination**: Stops when only one frequent itemset remains (cannot generate larger itemsets)

**Complexity**:
- Time Complexity: O(2^n × m) where n is the number of unique items and m is the number of transactions
- Space Complexity: O(2^n) for storing frequent itemsets and candidates
- **Note**: For production use with large datasets, consider optimized variants like FP-Growth

### Configuration Options

The algorithm accepts a `MiningConfig` object:
```typescript
{
  minSupport: number;      // Between 0 and 1 (e.g., 0.2 = 20%)
  minConfidence: number;   // Between 0 and 1 (e.g., 0.5 = 50%)
}
```

### Algorithm Limitations

- **Scalability**: Current implementation is suitable for small-medium datasets (< 10,000 transactions, < 100 unique items)
- **Memory**: All transactions and results are held in memory
- **Performance**: For large datasets, consider implementing FP-Growth or Eclat algorithms

---

## Project Structure Explanation

```
Homework3-main/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   │   └── favicon.png
│   └── src/
│       ├── components/       # Reusable UI components
│       │   └── ui/          # shadcn/ui component library (40+ components)
│       ├── hooks/           # Custom React hooks
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       ├── lib/             # Utility libraries
│       │   ├── queryClient.ts  # React Query configuration
│       │   └── utils.ts        # Helper functions
│       ├── pages/           # Page components
│       │   ├── shop.tsx          # Shopping interface
│       │   ├── transactions.tsx  # Transaction history
│       │   ├── mining-results.tsx # Results display
│       │   ├── settings.tsx       # Algorithm configuration
│       │   └── not-found.tsx    # 404 page
│       ├── App.tsx          # Main application component
│       ├── main.tsx         # Application entry point
│       └── index.css        # Global styles
│
├── server/                   # Backend Express application
│   ├── apriori.ts          # Apriori algorithm implementation
│   ├── index.ts            # Server entry point and middleware
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # In-memory storage implementation
│   └── vite.ts             # Vite development server setup
│
├── shared/                   # Shared code between client and server
│   └── schema.ts           # TypeScript types and Zod schemas
│
├── attached_assets/          # Project assets and data files
│
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── drizzle.config.ts       # Database ORM configuration (unused)
├── components.json         # shadcn/ui configuration
├── design_guidelines.md    # Design system documentation
└── README.md              # This file
```

### Key Files

**Frontend**:
- `client/src/App.tsx`: Main application component with routing
- `client/src/pages/shop.tsx`: Shopping interface with cart management
- `client/src/pages/transactions.tsx`: Transaction history and CSV import
- `client/src/pages/settings.tsx`: Mining algorithm configuration
- `client/src/pages/mining-results.tsx`: Results visualization

**Backend**:
- `server/index.ts`: Express server setup and middleware
- `server/routes.ts`: REST API endpoint definitions
- `server/apriori.ts`: Core Apriori algorithm implementation
- `server/storage.ts`: In-memory data storage (MemStorage class)

**Shared**:
- `shared/schema.ts`: TypeScript interfaces and Zod validation schemas
  - Product, Transaction types
  - MiningConfig, MiningResult types
  - FrequentItemset, AssociationRule types

### Build Configuration

- **TypeScript**: Strict mode enabled, ES modules, path aliases configured
- **Vite**: Fast HMR, React plugin, optimized builds
- **Tailwind**: Custom design tokens, Material Design 3 colors
- **Path Aliases**:
  - `@/*` → `client/src/*`
  - `@shared/*` → `shared/*`

---

## API Endpoints

### Products
- `GET /api/products` - Retrieve all products in catalog

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `POST /api/transactions/import` - Bulk import transactions from CSV
- `GET /api/transactions/stats` - Get transaction statistics

### Mining
- `POST /api/mining/run` - Execute Apriori algorithm with configuration
- `GET /api/mining/results` - Retrieve last mining results

---

## Development Notes

### Data Storage

Currently, the application uses **in-memory storage** (`MemStorage` class). All data (products, transactions, mining results) is lost when the server restarts. While Drizzle ORM is configured for PostgreSQL, it is not actively used.

### Future Enhancements

Potential improvements for production use:
- Persist data to database (PostgreSQL with Drizzle ORM)
- Add user authentication and session management
- Implement pagination for large transaction lists
- Add caching for frequently accessed data
- Optimize algorithm for larger datasets (FP-Growth implementation)
- Add unit and integration tests
- Implement error logging and monitoring

---

## License

MIT License

---

## Author

Data Mining Project - Association Rule Mining Application

