'use client';

import React from 'react';
import {
  Heart,
  Plus,
  Edit2,
  Trash2,
  Globe,
  ExternalLink,
  LayoutGrid,
  Box,
  X,
  MessageSquare,
  Share2,
  Lock,
  Globe2,
  Sparkles,
  User
} from 'lucide-react';
import { Category, QuickToolLink, VaultSpace } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { DBStatus } from '../apiClient';

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface SidebarProps {
  activeSpace: VaultSpace;
  onChangeSpace: (space: VaultSpace) => void;
  categories: Category[];
  quickLinks: QuickToolLink[];
  selectedCategory: string | null;
  onlyFavorites: boolean;
  promptCountByCategory: Record<string, number>;
  totalPromptsCount: number;
  favoritePromptsCount: number;
  dbStatus: DBStatus | null;
  onSelectCategory: (catId: string | null) => void;
  onToggleOnlyFavorites: () => void;
  onOpenCreateCategory: () => void;
  onOpenEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onOpenAddQuickLink: () => void;
  onOpenEditQuickLink: (link: QuickToolLink) => void;
  onDeleteQuickLink: (id: string) => void;
  onToggleFavoriteQuickLink?: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDeveloperModal?: () => void;
  onOpenFeedback?: () => void;
  onShareApp?: () => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  activeSpace,
  onChangeSpace,
  categories,
  quickLinks,
  selectedCategory,
  onlyFavorites,
  promptCountByCategory,
  totalPromptsCount,
  favoritePromptsCount,
  dbStatus,
  onSelectCategory,
  onToggleOnlyFavorites,
  onOpenCreateCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenAddQuickLink,
  onOpenEditQuickLink,
  onDeleteQuickLink,
  onToggleFavoriteQuickLink,
  isMobileOpen,
  onCloseMobile,
  onOpenDeveloperModal,
  onOpenFeedback,
  onShareApp,
}) => {
  const isConnected = dbStatus?.connected === true;

  const handleNavClick = (callback: () => void) => {
    callback();
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 sm:w-60 max-w-[85vw] bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-mono font-bold text-sm">
              <Box className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white font-mono">BOX</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Space Switcher (Public vs Personal) */}
          <div className="p-1 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                handleNavClick(() => {
                  onChangeSpace('public');
                  onSelectCategory(null);
                });
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                activeSpace === 'public'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Public Community Vault (No login required)"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Public</span>
            </button>

            <button
              onClick={() => {
                handleNavClick(() => {
                  onChangeSpace('personal');
                  onSelectCategory(null);
                });
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                activeSpace === 'personal'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Personal Space (Requires Login)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Personal</span>
            </button>
          </div>

          {/* Main Navigation Views */}
          <div className="space-y-1">
            <button
              onClick={() => {
                handleNavClick(() => {
                  onSelectCategory(null);
                  if (onlyFavorites) onToggleOnlyFavorites();
                });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === null && !onlyFavorites
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4" />
                <span>{activeSpace === 'personal' ? 'My Prompts' : 'All Prompts'}</span>
              </div>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">
                {totalPromptsCount}
              </span>
            </button>

            <button
              onClick={() => {
                handleNavClick(() => {
                  onToggleOnlyFavorites();
                });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                onlyFavorites
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-white text-white' : 'text-zinc-400'}`} />
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
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Categories
              </span>
              <button
                onClick={() => {
                  onOpenCreateCategory();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="text-xs text-zinc-400 hover:text-zinc-100 p-1 rounded transition flex items-center gap-1"
                title="Add Category"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {categories.length > 0 ? (
              <div className="space-y-0.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id && !onlyFavorites;
                  const count = promptCountByCategory[cat.id] || 0;
                  const colorClass = cat.color?.startsWith('bg-') ? cat.color : 'bg-zinc-700';

                  return (
                    <div
                      key={cat.id}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                      onClick={() => {
                        handleNavClick(() => {
                          if (onlyFavorites) onToggleOnlyFavorites();
                          onSelectCategory(cat.id);
                        });
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`p-1 rounded ${colorClass} text-white shrink-0`}>
                          <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex lg:hidden group-hover:flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditCategory(cat);
                              if (window.innerWidth < 1024) onCloseMobile();
                            }}
                            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-700"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCategory(cat);
                              if (window.innerWidth < 1024) onCloseMobile();
                            }}
                            className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
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
                onClick={() => {
                  onOpenCreateCategory();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New category</span>
              </button>
            )}
          </div>

          {/* Web Links */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Links
              </span>
              <button
                onClick={() => {
                  onOpenAddQuickLink();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="text-xs text-zinc-400 hover:text-zinc-100 p-1 rounded transition flex items-center gap-1"
                title="Add Link"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {quickLinks.length > 0 ? (
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <div
                    key={link.id}
                    className="group flex items-center justify-between px-2 py-2 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 flex-1 py-0.5"
                      title={link.url}
                    >
                      <div className="p-1 rounded bg-zinc-800 text-zinc-300 shrink-0">
                        <Globe className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-zinc-300 group-hover:text-white truncate">
                        {link.name}
                      </span>
                    </a>

                    <div className="flex items-center gap-0.5">
                      {onToggleFavoriteQuickLink && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavoriteQuickLink(link.id);
                          }}
                          className={`p-1 rounded transition ${
                            link.isFavorite
                              ? 'text-red-400 bg-red-950/40'
                              : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
                          }`}
                          title={
                            activeSpace === 'public'
                              ? link.isFavorite
                                ? 'Saved in Personal Space'
                                : 'Like & Save to Personal Space'
                              : link.isFavorite
                              ? 'Remove Favorite'
                              : 'Add to Favorites'
                          }
                        >
                          <Heart className={`w-3 h-3 ${link.isFavorite ? 'fill-red-400' : ''}`} />
                        </button>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-zinc-400 hover:text-zinc-200"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => {
                          onOpenEditQuickLink(link);
                          if (window.innerWidth < 1024) onCloseMobile();
                        }}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-700 transition"
                        title="Edit Link"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteQuickLink(link.id)}
                        className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-700 transition"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAddQuickLink();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New link</span>
              </button>
            )}
          </div>
        </div>

        {/* Developer & Footer Status */}
        <div className="p-3 border-t border-zinc-800/80 space-y-2.5">
          {/* Developer Card */}
          <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (onOpenDeveloperModal) onOpenDeveloperModal();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="flex items-center gap-2 min-w-0 text-left hover:opacity-90 transition group flex-1"
                title="View Developer Profile"
              >
                <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white font-mono shrink-0">
                  DS
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate font-mono">
                    DEVARAJA S G
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    Developer
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href="https://github.com/Devarajagurusamy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                  title="GitHub"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://linkedin.com/in/devaraja-s-g"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://devaraja-fs-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                  title="Portfolio"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Feedback & Share Bar */}
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={() => {
                  if (onOpenFeedback) onOpenFeedback();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 hover:text-white text-zinc-300 text-[11px] font-medium transition"
                title="Send Feedback to Developer"
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>Feedback</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onShareApp) onShareApp();
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 hover:text-white text-zinc-300 text-[11px] font-medium transition"
                title="Share BOX Vault"
              >
                <Share2 className="w-3 h-3 text-zinc-400" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* DB Status */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-zinc-500'
                }`}
              />
              <span className="text-zinc-400 font-medium">
                {isConnected ? 'MongoDB' : 'Local'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Sidebar = React.memo(SidebarComponent);
