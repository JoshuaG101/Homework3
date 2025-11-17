# Design Guidelines: Interactive Supermarket Data Mining Application

## Design Approach

**Selected System:** Material Design 3
**Justification:** This educational data mining tool requires clear information hierarchy, robust data display patterns, and interactive components for algorithm configuration. Material Design excels at content-rich applications with strong visual feedback and systematic organization of complex data.

**Key Design Principles:**
- Clarity over decoration - prioritize information legibility
- Systematic organization of dense data (transactions, rules, metrics)
- Clear visual hierarchy for algorithm parameters and results
- Interactive feedback for user actions

---

## Typography

**Font Family:** Roboto (via Google Fonts CDN)
- Display/Headers: Roboto Medium (500) - Algorithm titles, section headers
- Body/Data: Roboto Regular (400) - Transaction lists, product names, rule descriptions
- Metrics/Numbers: Roboto Mono - Support/confidence percentages, counts

**Scale:**
- H1 (Page titles): text-3xl md:text-4xl
- H2 (Section headers): text-2xl md:text-3xl
- H3 (Component titles): text-xl md:text-2xl
- Body: text-base
- Small/Captions: text-sm
- Data labels: text-xs uppercase tracking-wide

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8
- Micro spacing (within components): p-2, gap-2
- Component padding: p-4, p-6
- Section spacing: py-8, gap-8
- Page-level margins: p-8, md:p-12

**Grid Structure:**
- Two-column main layout (70/30 split): Shopping interface (left) | Cart/Stats (right)
- Dashboard: 3-column grid for metrics (grid-cols-1 md:grid-cols-3)
- Product grid: 3-4 columns (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
- Rule results: Full-width table/list with clear row separation

---

## Component Library

### Navigation
Top app bar with tabs: "Shop" | "Transactions" | "Mining Results" | "Settings"
- Fixed position, elevated shadow
- Icons from Material Icons CDN

### Shopping Interface
- Product cards: Image placeholder, name, price, "Add to Cart" button
- Card elevation on hover
- Compact grid layout with clear product information

### Shopping Cart (Sidebar)
- Sticky positioned panel
- Line items with quantity controls (+/-)
- Subtotal and "Complete Purchase" CTA
- Transaction count badge

### Data Mining Controls
- Configuration panel with sliders for min support/confidence
- Number inputs with validation
- "Run Algorithm" primary action button
- Algorithm selection (Apriori/FP-Growth) via segmented buttons

### Results Display
**Frequent Itemsets:**
- Chip-based display showing item combinations
- Support percentage badges
- Collapsible sections by itemset size

**Association Rules:**
- Table format: Antecedent → Consequent | Support | Confidence | Lift
- Visual arrows (→) between item groups
- Sortable columns
- Highlight rules above confidence threshold

**Statistics Dashboard:**
- Metric cards (3-column grid): Total Rules, Avg Confidence, Processing Time
- Mini charts showing distribution (use Chart.js for simple bar charts)

### Transaction History
- List view with expandable rows
- Transaction ID, timestamp, item count
- Expand to show full item list

---

## Interaction Patterns

- **Add to Cart:** Immediate feedback with cart count badge animation
- **Complete Purchase:** Confirmation dialog, then transaction saved
- **Run Mining:** Loading spinner with progress indicator, disable controls during processing
- **View Rules:** Expandable rows for detailed metrics, tooltips for algorithm explanations

---

## Images

**No hero image needed.** This is a functional application, not a marketing site.

**Product Placeholders:**
- Use simple colored rectangles with product category icons (from Material Icons)
- Size: Square aspect ratio (1:1), approximately 150x150px
- Consistent placeholder style across all products

**Icon Usage:**
- Material Icons CDN for all UI elements
- Shopping cart, settings, database, analytics icons
- Product category icons (food, beverages, household items)

---

## Data Visualization

- Use simple, clear charts (Chart.js library)
- Bar charts for itemset frequency
- No unnecessary animations
- Clear axis labels and legends
- Responsive scaling for mobile

---

## Responsive Behavior

**Desktop (lg+):** Two-column layout with persistent cart sidebar
**Tablet (md):** Collapsible cart drawer, single column shopping grid
**Mobile:** Stack all content, floating cart button with drawer overlay

---

**Output Quality Standard:** Create a clean, professional data mining application interface that prioritizes information clarity, efficient workflow, and comprehensive data display. Every component should serve the functional needs of transaction simulation and rule discovery.