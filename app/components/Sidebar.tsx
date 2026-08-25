'use client';

import React from 'react';
import {
  Layers,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Globe,
  ExternalLink,
  LayoutGrid,
  Box,
  Database
} from 'lucide-react';
import { Category, AIModelType, QuickToolLink } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { DBStatus } from '../apiClient';

const AI_MODELS: (AIModelType | 'ALL')[] = [
  'ALL',
  'ChatGPT',
  'Claude',
  'Gemini',
  'DeepSeek',
  'Midjourney',
  'Cursor',
  'General',
];

interface SidebarProps {
  categories: Category[];
  quickLinks: QuickToolLink[];
  selectedCategory: string | null;
  selectedModel: AIModelType | 'ALL';
  onlyFavorites: boolean;
  promptCountByCategory: Record<string, number>;
  totalPromptsCount: number;
  favoritePromptsCount: number;
  dbStatus: DBStatus | null;
  onSelectCategory: (catId: string | null) => void;
  onSelectModel: (model: AIModelType | 'ALL') => void;
  onToggleOnlyFavorites: () => void;
  onOpenCreateCategory: () => void;
  onOpenEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onOpenAddQuickLink: () => void;
  onDeleteQuickLink: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  quickLinks,
  selectedCategory,
  selectedModel,
  onlyFavorites,
  promptCountByCategory,
  totalPromptsCount,
  favoritePromptsCount,
  dbStatus,
  onSelectCategory,
  onSelectModel,
  onToggleOnlyFavorites,
  onOpenCreateCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenAddQuickLink,
  onDeleteQuickLink,
  isMobileOpen,
  onCloseMobile,
}) => {
  const isConnected = dbStatus?.connected === true;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-mono font-bold text-sm">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white font-mono">BOX</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PROMPT VAULT
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Library and Link Manager</p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
          {/* Main Navigation Views */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectCategory(null);
                if (onlyFavorites) onToggleOnlyFavorites();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                selectedCategory === null && !onlyFavorites
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Prompts</span>
              </div>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">
                {totalPromptsCount}
              </span>
            </button>

            <button
              onClick={onToggleOnlyFavorites}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                onlyFavorites
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white text-white' : 'text-zinc-400'}`} />
                <span>Favorites</span>
              </div>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">
                {favoritePromptsCount}
              </span>
            </button>
          </div>

          {/* Categories List */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Categories
              </span>
              <button
                onClick={onOpenCreateCategory}
                className="text-[11px] text-zinc-400 hover:text-zinc-100 p-0.5 rounded transition flex items-center gap-1"
                title="Create New Category"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {categories.length > 0 ? (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id && !onlyFavorites;
                  const count = promptCountByCategory[cat.id] || 0;
                  const colorClass = cat.color?.startsWith('bg-') ? cat.color : 'bg-zinc-700';

                  return (
                    <div
                      key={cat.id}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                      onClick={() => {
                        if (onlyFavorites) onToggleOnlyFavorites();
                        onSelectCategory(cat.id);
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`p-1 rounded ${colorClass} text-white shrink-0`}>
                          <CategoryIcon name={cat.icon} className="w-3 h-3" />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditCategory(cat);
                            }}
                            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-700"
                            title="Edit Category"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCategory(cat);
                            }}
                            className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-700"
                            title="Delete Category"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-zinc-400 px-1 py-0.5 rounded bg-zinc-900">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <button
                onClick={onOpenCreateCategory}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-dashed border-zinc-800 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add first category</span>
              </button>
            )}
          </div>

          {/* AI Models Filter */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Model Filter
              </span>
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {AI_MODELS.map((m) => {
                const isSelected = selectedModel === m;
                return (
                  <button
                    key={m}
                    onClick={() => onSelectModel(m)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      isSelected
                        ? 'bg-zinc-200 text-zinc-950 font-semibold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stored Quick AI Web Links */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-zinc-400" />
                Web Links
              </span>
              <button
                onClick={onOpenAddQuickLink}
                className="text-[11px] text-zinc-400 hover:text-zinc-100 p-0.5 rounded transition flex items-center gap-1"
                title="Add Web Link"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {quickLinks.length > 0 ? (
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <div
                    key={link.id}
                    className="group flex items-center justify-between px-2 py-1.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 flex-1"
                      title={`Open ${link.name} (${link.url})`}
                    >
                      <div className="p-1 rounded bg-zinc-800 text-zinc-300 shrink-0">
                        <Globe className="w-2.5 h-2.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate">
                          {link.name}
                        </p>
                      </div>
                    </a>

                    <div className="flex items-center gap-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-0.5 text-zinc-400 hover:text-zinc-200"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button
                        onClick={() => onDeleteQuickLink(link.id)}
                        className="hidden group-hover:block p-0.5 text-zinc-400 hover:text-red-400"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={onOpenAddQuickLink}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-dashed border-zinc-800 transition flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add first web link</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer with Database Connection Status */}
        <div className="p-3 border-t border-zinc-800 space-y-1.5 bg-zinc-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Database className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-400">Database:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-zinc-500'
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isConnected ? 'text-emerald-400' : 'text-zinc-400'
                }`}
              >
                {isConnected ? 'MongoDB' : 'Local Vault'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 flex items-center justify-between">
            <span>BOX Prompt Vault</span>
            <span className="font-mono">v1.1</span>
          </div>
        </div>
      </aside>
    </>
  );
};
