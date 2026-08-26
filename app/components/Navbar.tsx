'use client';

import React from 'react';
import {
  Search,
  Plus,
  Menu,
  X,
  LogIn,
  UserPlus,
  MessageSquare,
  Share2,
  Globe2,
  Lock
} from 'lucide-react';
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton
} from '@clerk/nextjs';
import { VaultSpace } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSpace?: VaultSpace;
  onChangeSpace?: (space: VaultSpace) => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: (mode: 'grid' | 'list') => void;
  sortBy?: 'recent' | 'popular' | 'alpha';
  onChangeSortBy?: (sort: 'recent' | 'popular' | 'alpha') => void;
  onOpenCreatePrompt: () => void;
  onExport?: () => void;
  onImportFile?: (file: File) => void;
  onResetDemoData?: () => void;
  onToggleMobileSidebar: () => void;
  onOpenFeedback?: () => void;
  onShareApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeSpace = 'public',
  onChangeSpace,
  onOpenCreatePrompt,
  onToggleMobileSidebar,
  onOpenFeedback,
  onShareApp,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
      {/* Left: Mobile Menu Toggle & Space Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shrink-0 active:scale-95 transition"
          title="Open Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {onChangeSpace && (
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <button
              onClick={() => onChangeSpace('public')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
                activeSpace === 'public'
                  ? 'bg-zinc-800 text-white font-medium shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Public Community Vault"
            >
              <Globe2 className="w-3 h-3 text-blue-400" />
              <span>Public</span>
            </button>
            <button
              onClick={() => onChangeSpace('personal')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
                activeSpace === 'personal'
                  ? 'bg-zinc-800 text-white font-medium shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Personal Space (Requires Login)"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Personal</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative flex-1 min-w-0 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={activeSpace === 'personal' ? 'Search personal prompts...' : 'Search public prompts...'}
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
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onShareApp && (
          <button
            onClick={onShareApp}
            className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            title="Share Vault"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Share</span>
          </button>
        )}

        {onOpenFeedback && (
          <button
            onClick={onOpenFeedback}
            className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition flex items-center gap-1.5"
            title="Send Feedback"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Feedback</span>
          </button>
        )}

        <button
          onClick={onOpenCreatePrompt}
          className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white active:scale-95 rounded-lg transition shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">
            {activeSpace === 'personal' ? 'New Private Prompt' : 'New Prompt'}
          </span>
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
