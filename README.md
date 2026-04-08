# 🗓️ Interactive Seasonal Wall Calendar

A premium, state-of-the-art **Next.js 16** "Wall Art" calendar application. This project blends a physical wall-hanging aesthetic with a smart, automated seasonal engine that transforms the entire environment based on the current month.

---

## 🌟 Overview
This application is more than a utility—it's an interactive 3D environment. It features a high-fidelity "hanging" calendar with realistic physics, dynamic weather particles, and a **Seasonal Window Scenery** system that visualizes the world outside your virtual room.

---

## 🛠 Project Structure & Architecture

### 📁 Directory Layout
```text
intern/
├── app/
│   ├── calendar/
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

## 🎨 Frontend Design System

The application utilizes a sophisticated design system that blends classic layout principles with modern CSS-in-JS techniques.

### 🌓 Automated Theme Synchronization
The theme engine doesn't just change a single color—it re-skins the entire "room."
- **Variable Injection**: The `useCalendarTheme` hook monitors the calendar's active date. When the month changes, it identifies the correct seasonal theme and injects a set of predefined CSS variables (`--cal-primary`, `--cal-paper`, `--cal-bg`, etc.) directly into the `:root` pseudo-class.
- **Zero-Flash Transitions**: By using standard CSS variables, all components (Grid, Modals, Buttons) update instantly without a single line of component-level logic changes, ensuring high performance.

### 🖼️ Procedural Scenery Logic (`WallWindow`)
The "view" outside the window is built entirely with CSS primitives to avoid heavy image assets while maintaining a sharp, premium look:
1. **Terrain Synthesis**: Each season uses a unique `clip-path` polygon. 
   - We define a `TERRAIN_PATHS` constant mapping types like `drifts`, `hills`, and `cliffs` to complex polygon points.
   - For every landscape, we render **two layered terrains** (Back and Front) with different opacities and vertical positions to create a 2.5D depth effect.
2. **Celestial Rendering**: 
   - A single celestial `div` is styled using **Radial Gradients**.
   - **Sun Mode**: Uses warm gradients with a large spread `box-shadow` for intense bloom.
   - **Moon Mode**: Utilizes a silver-centric gradient and a `blur(1px)` halo overlay to simulate a cold, diffused nighttime atmosphere.

### 🌫️ Modern Aesthetics
- **Glassmorphism**: Navigation headers and modal backdrops use `backdrop-blur-xl` combined with high-transparency white overlays (`white/10`) to create a frosted-glass effect that lets background themes peek through.
- **Micro-Animations**: 
  - **The Jiggle**: Triggered by the "Breeze" effect, the calendar card uses a synchronous `framer-motion` sequence that rotates it slightly around its "top-center" anchor point.
  - **The Flip**: Navigating months triggers a 3D `rotateX` flip variants, simulating a physical page turn.

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
