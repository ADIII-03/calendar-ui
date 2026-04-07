# 🗓️ High-Fidelity 3D Interactive Wall Calendar

A premium, physics-based "Hanging Wall" calendar application built with **Next.js 15**, **Tailwind CSS v4**, and **Framer Motion**. This project simulates the tactile feel of a physical calendar while providing powerful digital organization tools.

---

## 🌟 Overview
This component was designed as a functional piece of **Wall Art**. It goes beyond a simple date grid by incorporating a 3D environment, realistic "fluttering" physics, and a deep theme engine that changes the entire room's atmosphere.

---

## 🛠 Project Structure & Models

### 📁 Directory Layout
```text
intern/
├── app/
│   ├── calendar/
│   │   ├── components/       # UI Components (Grid, Modals, History)
│   │   ├── hooks/            # Custom Logic (Date Math, Theme Engine)
│   │   └── page.tsx          # Main Entry Point
│   ├── globals.css           # Design Tokens & Theme Variables
│   └── layout.tsx            # No-Scroll Viewport Base
├── lib/
│   └── utils.ts              # Tailwind/Class Merging Utilities
└── public/                   # High-Definition Theme Assets
```

### 📅 Core Data Model (`StoredItem`)
We use a unified interface for all user-created content to handle background notes and visual grid labels.
```typescript
type StoredItem = {
  id: string;             // Unique ID for safe deletion
  text: string;           // Note/Event content
  type: 'note' | 'event'; // Type determines grid rendering
  createdAt: string;      // ISO timestamp for chronological history
};
```

---

## ✨ Key Features (Baseline & Creative)

### 🏔️ Wall Calendar Aesthetic
- **Hero Image Integration**: Each month features a hand-picked, high-definition hero image that sets the mood for the calendar card.
- **Physical "Flutter"**: Periodically, "Wind Streaks" sweep from the left window, causing the calendar to flutter and jiggle with realistic anchor-point physics using `framer-motion` anchors.
- **3D Depth**: Subtle perspective transforms (`rotateY`, `rotateX`) give the calendar a tangible presence on the wall.

### 🍱 Smart Day Range Selector
- **Selection Engine**: Hand-crafted `useDateRange` hook manages `Start -> Hover -> End` states.
- **Continuous Visuals**: Multi-day events appear as a **single uninterrupted bar** across the grid using negative horizontal margins and smart corner rounding.
- **Lane Consistency**: Events are sorted by ID, ensuring they stay in the same vertical "Lane" across multiple days to prevent layout flickering.

### 📋 Integrated Notes & Schedule Manager
- **Daily Snapshot**: Double-clicking a date opens a high-fidelity "Page" view uniquely themed to match the month.
- **Schedule Manager**: Add multiple events or notes to any date range. These are persisted instantly to `localStorage`.
- **History Drawer**: A searchable record of all your notes and events, grouped by date.

### 📱 Fully Responsive Design
- **Desktop**: A side-by-side arrangement with a high-fidelity "Wall Window" on the left that updates its lighting based on the active theme.
- **Mobile**: The layout collapses into a vertical stack; the "Window" becomes a backdrop, and the calendar scales to provide a "Full Screen" touch experience with no scrolling.

---

## 🎨 Theme Engine
We have implemented **5 distinct environments** that go beyond simple CSS colors:
1. **Wood**: Dark, cozy aesthetic with rustic borders.
2. **Neon**: Vibrant glows and dark-mode optimization.
3. **Vintage**: Sepia-toned historical feel with paper textures.
4. **Concrete**: Modern, minimalist industrial design.
5. **Brick**: Classic urban wall textures.

Every theme injects specific CSS variables (`--cal-primary`, `--cal-paper`, `--cal-border`) into the document root for a zero-flash transition.

---

## 🚀 Local Setup Instructions

### 1. Requirements
- **Node.js** (v18 or higher)
- **NPM** or **PNPM**

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-link>
cd <repo-folder>

# Install dependencies
npm install

# Build UI Primitives & Animations
npm install framer-motion date-fns lucide-react clsx tailwind-merge
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000/calendar](http://localhost:3000/calendar) to see the app.

---

## 🛠️ Design Tools & Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Using CSS-variable-first theming)
- **Animation**: Framer Motion (Orchestrating the jiggle loops, page flips, and lane shifts)
- **Icons**: Lucide React
- **Date Math**: `date-fns` (Pure functional date logic)
- **Aesthetics**: Glassmorphism, CSS Perspective, and Custom-themed Scrollbars.

---

## 🧩 Architectural Choices
- **Atomic Components**: `DayCell` is isolated and memoized to prevent re-rendering the entire 42-cell grid during hover actions.
- **Persistence Layer**: Custom `localStorage` bridge with an event-based sync system (`CustomEvent`).
- **No-Scroll Policy**: To maintain the "Wall Art" immersion, the application is locked to `h-screen` and `overflow-hidden`, preventing traditional website scrolling.
