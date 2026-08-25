'use client';

import React, { useRef } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Download,
  Upload,
  RotateCcw,
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
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  sortBy: 'recent' | 'popular' | 'alpha';
  onChangeSortBy: (sort: 'recent' | 'popular' | 'alpha') => void;
  onOpenCreatePrompt: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onResetDemoData: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  sortBy,
  onChangeSortBy,
  onOpenCreatePrompt,
  onExport,
  onImportFile,
  onResetDemoData,
  onToggleMobileSidebar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onImportFile(files[0]);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5 flex flex-col gap-2.5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".json"
        className="hidden"
      />

      {/* Main Row: Mobile Menu + Search Bar + Actions + Auth */}
      <div className="flex items-center justify-between gap-2.5 w-full">
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

        {/* Desktop Controls (Sort, View Mode, Export/Import) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
            <select
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as 'recent' | 'popular' | 'alpha')}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="recent" className="bg-zinc-900 text-white">Recent</option>
              <option value="popular" className="bg-zinc-900 text-white">Popular</option>
              <option value="alpha" className="bg-zinc-900 text-white">A-Z</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Backup Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="Export Vault"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="Import Backup"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onResetDemoData}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="Clear Vault"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
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
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-7 h-7',
                    },
                  }}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>

      {/* Secondary Controls Row on Mobile Only */}
      <div className="flex items-center justify-between gap-2 pt-1 sm:hidden border-t border-zinc-800/40">
        {/* Sort */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 flex-1 max-w-[140px]">
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as 'recent' | 'popular' | 'alpha')}
            className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="recent" className="bg-zinc-900 text-white">Recent</option>
            <option value="popular" className="bg-zinc-900 text-white">Popular</option>
            <option value="alpha" className="bg-zinc-900 text-white">A-Z</option>
          </select>
        </div>

        {/* View Toggle + Vault Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onExport}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            title="Export"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            title="Import"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetDemoData}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            title="Clear Vault"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
