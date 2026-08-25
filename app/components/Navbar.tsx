'use client';

import React from 'react';
import {
  Search,
  Plus,
  Menu,
  X,
  LogIn,
  UserPlus
} from 'lucide-react';
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton
} from '@clerk/nextjs';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: (mode: 'grid' | 'list') => void;
  sortBy?: 'recent' | 'popular' | 'alpha';
  onChangeSortBy?: (sort: 'recent' | 'popular' | 'alpha') => void;
  onOpenCreatePrompt: () => void;
  onExport?: () => void;
  onImportFile?: (file: File) => void;
  onResetDemoData?: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreatePrompt,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onToggleMobileSidebar}
        className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shrink-0 active:scale-95 transition"
        title="Open Menu"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Search Bar */}
      <div className="relative flex-1 min-w-0 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prompts..."
          className="w-full pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right CTA + Auth Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCreatePrompt}
          className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white active:scale-95 rounded-lg transition shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Prompt</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Clerk Auth Controls */}
        <div className="flex items-center gap-1.5 border-l border-zinc-800/80 pl-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition">
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition">
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Up</span>
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center justify-center">
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
};
