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
  SlidersHorizontal,
  X
} from 'lucide-react';
import { AIModelType } from '../types';

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
    <header className="sticky top-0 z-20 w-full bg-zinc-950/95 border-b border-zinc-800 px-4 lg:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".json"
        className="hidden"
      />

      {/* Search Input */}
      <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prompts, categories, tags, links (Press '/' to focus)..."
            className="w-full pl-9 pr-12 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-400 focus:outline-none transition"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
              /
            </span>
          )}
        </div>
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
        {/* Sort */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5">
          <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as 'recent' | 'popular' | 'alpha')}
            className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer pr-1"
          >
            <option value="recent" className="bg-zinc-900 text-white">
              Recently Added
            </option>
            <option value="popular" className="bg-zinc-900 text-white">
              Most Copied
            </option>
            <option value="alpha" className="bg-zinc-900 text-white">
              Alphabetical (A-Z)
            </option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => onToggleViewMode('grid')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'grid'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleViewMode('list')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'list'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Backup / Export / Import / Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={onExport}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="Export JSON Vault"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="Import JSON Vault"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetDemoData}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="Reset Default Prompts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenCreatePrompt}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Prompt</span>
        </button>
      </div>
    </header>
  );
};
