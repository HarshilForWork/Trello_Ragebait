# Vaishu Organizer

A modern, beautiful, and feature-rich Kanban task management application built with **React**, **TailwindCSS**, and **Supabase**.

## ✨ Features

### 🔐 Authentication & Security
- **Secure Login/Signup**: Email/password authentication via Supabase Auth
- **Data Isolation**: Private boards and notes using Row Level Security (RLS)
- **Session Management**: Persistent sessions with automatic token refreshing

### 📋 Kanban Board Management
- **Multiple Boards**: Create, rename, and delete boards
- **Lists**: Organize tasks into customizable columns
- **Cards**: Rich task cards with titles, descriptions, and due dates
- **Drag & Drop**: Smooth reordering powered by `@dnd-kit`

### 🌳 Advanced Subtasks
- **Nested Checklists**: Create multiple levels of sub-tasks
- **Progress Tracking**: Visual progress bars for task completion
- **Expand/Collapse**: Fold complex sub-task trees for better visibility

### 📊 Dashboard View (NEW!)
Switch between Kanban and Dashboard views for different perspectives on your tasks.

#### Dashboard Widgets:
- **📅 Calendar Widget**
  - View tasks by day, week, or month
  - Blue dots indicate days with tasks
  - Add tasks directly with auto-filled due dates
  - Add subtasks when creating tasks

- **📈 Progress Widget**
  - Track daily, weekly, and monthly task completion
  - Animated progress bars
  - Click "Show Tasks" to see task list
  - Click tasks to view subtasks and descriptions
  - Toggle subtasks complete directly

- **🗂️ Quick View Widget**
  - Browse all boards from dropdown
  - Expand/collapse lists
  - Add tasks quickly to any list
  - See subtask progress and due dates

- **📝 Notes Widget**
  - Create quick notes with title and description
  - Click to expand/collapse long notes
  - Delete notes on hover

#### Dashboard Features:
- **Drag & Drop Widgets**: Rearrange by dragging headers
- **Resizable Widgets**: Drag corners to resize
- **Persistent Layout**: Positions saved automatically
- **Reset Layout**: Button to restore default layout

### 🎨 Beautiful UI/UX
- **Glassmorphism Design**: Modern frosted glass aesthetics
- **Custom Wallpapers**: 8 presets or upload your own background
- **Animations**: Smooth transitions using `framer-motion`
- **Dark Mode**: Optimized for visual comfort

### 📝 Productivity Tools
- **Quick Notes**: Side-panel for quick text notes
- **Import/Export**: JSON backup and migration
- **Help Guide**: In-app help with feature tips (? button)

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
- **Calendar**: Custom calendar component
- **Grid Layout**: react-grid-layout

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
   Run the SQL queries from `supabase/schema.sql` in your Supabase SQL Editor to set up:
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
├── components/
│   ├── ui/              # Radix + Tailwind components
│   ├── widgets/         # Dashboard widgets (Calendar, Progress, etc.)
│   └── Dashboard.jsx    # Dashboard layout with grid
├── lib/                 # Utilities (Supabase client)
├── store/               # Context Providers (State, Auth)
├── App.jsx              # Main Application Logic
├── index.css            # Global Styles & Tailwind Directives
└── main.jsx             # Entry Point
```

---

## 🎯 Quick Start Guide

1. **Create a Board**: Click ➕ in the header
2. **Add Lists**: Click "Add List" on your board
3. **Create Cards**: Click ➕ on any list
4. **Add Due Dates**: Set due dates for calendar integration
5. **Switch Views**: Click Dashboard/Kanban toggle button
6. **Get Help**: Click ? button for feature guide

---

## 🛡️ License

This project is licensed under the MIT License.
