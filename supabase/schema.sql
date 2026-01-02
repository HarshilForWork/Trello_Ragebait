-- Mini-Trello Database Schema with User Authentication
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Drop existing policies (if upgrading)
-- ============================================
DROP POLICY IF EXISTS "Public access" ON boards;
DROP POLICY IF EXISTS "Public access" ON lists;
DROP POLICY IF EXISTS "Public access" ON cards;
DROP POLICY IF EXISTS "Public access" ON checklist_items;
DROP POLICY IF EXISTS "Public access" ON notes;
DROP POLICY IF EXISTS "Users can manage their own boards" ON boards;
DROP POLICY IF EXISTS "Users can manage lists in their boards" ON lists;
DROP POLICY IF EXISTS "Users can manage cards in their boards" ON cards;
DROP POLICY IF EXISTS "Users can manage checklist items in their cards" ON checklist_items;
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;

-- ============================================
-- STEP 2: Create/Update Tables
-- ============================================

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  position INT DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add user_id column if it doesn't exist
ALTER TABLE boards ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Lists table  
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT DEFAULT 0
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INT DEFAULT 0
);

-- Checklist items table (supports nested sub-items via parent_id)
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  parent_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE
);

-- Add parent_id column if it doesn't exist (for migration)
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE;

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add user_id column if it doesn't exist
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- STEP 3: Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_card_id ON checklist_items(card_id);
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- ============================================
-- STEP 4: Enable Row Level Security
-- ============================================
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS Policies (User-based access)
-- ============================================

-- Boards: Users can only access their own boards
CREATE POLICY "Users can manage their own boards" ON boards
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lists: Users can access lists in their boards
CREATE POLICY "Users can manage lists in their boards" ON lists
  FOR ALL
  USING (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()))
  WITH CHECK (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

-- Cards: Users can access cards in their boards
CREATE POLICY "Users can manage cards in their boards" ON cards
  FOR ALL
  USING (list_id IN (
    SELECT l.id FROM lists l 
    JOIN boards b ON l.board_id = b.id 
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (list_id IN (
    SELECT l.id FROM lists l 
    JOIN boards b ON l.board_id = b.id 
    WHERE b.user_id = auth.uid()
  ));

-- Checklist items: Users can access items in their cards
CREATE POLICY "Users can manage checklist items in their cards" ON checklist_items
  FOR ALL
  USING (card_id IN (
    SELECT c.id FROM cards c
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (card_id IN (
    SELECT c.id FROM cards c
    JOIN lists l ON c.list_id = l.id
    JOIN boards b ON l.board_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Notes: Users can only access their own notes
CREATE POLICY "Users can manage their own notes" ON notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
