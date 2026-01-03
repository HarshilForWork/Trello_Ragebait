# Mini-Trello

A modern, beautiful, and feature-rich Kanban task management application built with **React**, **TailwindCSS**, and **Supabase**.

![Project Screenshot](https://i.imgur.com/your-image-placeholder.png)

## ✨ Features

### 🔐 Authentication & Security
- **Secure Login/Signup**: Support for email/password authentication via Supabase Auth.
- **Data Isolation**: Each user has their own private boards and notes using Row Level Security (RLS).
- **Session Management**: Persistent sessions with automatic token refreshing.

### 📋 Kanban Board Management
- **Boards**: Create, rename, and delete multiple boards.
- **Lists**: Organize tasks into customizable lists.
- **Cards**: Rich task cards with titles, descriptions, and checklists.
- **Buttery Smooth Drag & Drop**: powered by `@dnd-kit` for reordering lists and cards.

### 🌳 Advanced Subtasks
- **Nested Checklists**: Create infinite levels of sub-tasks (recursive checklists).
- **Progress Tracking**: Visual progress bars for task completion.
- **Expand/Collapse**: Fold complex sub-task trees for better visibility.

### 🎨 Beautiful UI/UX
- **Glassmorphism Design**: Modern frosted glass aesthetics.
- **Custom Wallpapers**: Choose from 8 high-quality presets or upload your own background.
- **Animations**: Smooth transitions and layout shifts using `framer-motion`.
- **Dark Mode**: Optimized for visual comfort.

### 📝 Productivity Tools
- **Quick Notes**: Side-panel for jotting down quick text notes unrelated to specific cards.
- **Import/Export**: Full JSON import/export capabilities for data backup and migration.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS, Tailwind Animate
- **State Management**: React Context + Hooks
- **Backend / DB**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **UI Components**: Radix UI Primitives

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A [Supabase](https://supabase.com) account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Custom_Trello
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup Database**
   Run the SQL queries from `supabase/schema.sql` in your Supabase SQL Editor to sets up:
   - Tables (`boards`, `lists`, `cards`, `checklist_items`, `notes`)
   - Row Level Security (RLS) policies
   - Authenticated user access controls

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the app.

---

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Radix + Tailwind components (Dialogs, Menus, etc.)
│   └── ...
├── lib/               # Utilities (Supabase client, classes)
├── store/             # Context Providers (State, Auth)
├── App.jsx            # Main Application Logic
├── index.css          # Global Styles & Tailwind Directives
└── main.jsx           # Entry Point
```

## 🛡️ License

This project is licensed under the MIT License.
