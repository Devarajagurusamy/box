'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Heart,
  RotateCcw,
  SlidersHorizontal,
  X,
  LayoutGrid,
  FolderPlus,
  Sparkles
} from 'lucide-react';
import {
  Prompt,
  Category,
  QuickToolLink,
  AIModelType,
  ToastMessage
} from './types';
import {
  getStoredPrompts,
  saveStoredPrompts,
  getStoredCategories,
  saveStoredCategories,
  getStoredQuickLinks,
  saveStoredQuickLinks,
  exportVaultJSON,
  importVaultJSON,
  clearVaultData
} from './storage';
import {
  checkDBStatus,
  DBStatus,
  apiFetchPrompts,
  apiSavePrompt,
  apiDeletePrompt,
  apiFetchCategories,
  apiSaveCategory,
  apiDeleteCategory,
  apiFetchQuickLinks,
  apiSaveQuickLink,
  apiDeleteQuickLink,
  apiClearDatabase
} from './apiClient';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { PromptCard } from './components/PromptCard';
import { PromptModal } from './components/PromptModal';
import { PromptDetailModal } from './components/PromptDetailModal';
import { CategoryModal } from './components/CategoryModal';
import { QuickLinkModal } from './components/QuickLinkModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer } from './components/Toast';
import { CategoryIcon } from './components/CategoryIcon';

export default function Home() {
  // Loaded Data
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickToolLink[]>([]);
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelType | 'ALL'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alpha'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [promptToView, setPromptToView] = useState<Prompt | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
  const [quickLinkToEdit, setQuickLinkToEdit] = useState<QuickToolLink | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load (Fetches directly from MongoDB if connected, or clean local store)
  useEffect(() => {
    async function initData() {
      // First load local cache
      const localCats = getStoredCategories();
      const localPrompts = getStoredPrompts();
      const localLinks = getStoredQuickLinks();

      setCategories(localCats);
      setPrompts(localPrompts);
      setQuickLinks(localLinks);
      setIsLoaded(true);

      // Check DB connectivity
      try {
        const status = await checkDBStatus();
        setDbStatus(status);

        if (status.connected) {
          const [remotePrompts, remoteCats, remoteLinks] = await Promise.all([
            apiFetchPrompts(),
            apiFetchCategories(),
            apiFetchQuickLinks(),
          ]);

          if (remoteCats) {
            setCategories(remoteCats);
            saveStoredCategories(remoteCats);
          }
          if (remotePrompts) {
            setPrompts(remotePrompts);
            saveStoredPrompts(remotePrompts);
          }
          if (remoteLinks) {
            setQuickLinks(remoteLinks);
            saveStoredQuickLinks(remoteLinks);
          }
        }
      } catch {
        // Fallback to local storage
      }
    }

    initData();
  }, []);

  // Keyboard Shortcuts ('/' for search, 'N' for new prompt)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        isPromptModalOpen ||
        isDetailModalOpen ||
        isCategoryModalOpen ||
        isQuickLinkModalOpen ||
        deleteModal.isOpen
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search prompts"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      } else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setPromptToEdit(null);
        setIsPromptModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPromptModalOpen,
    isDetailModalOpen,
    isCategoryModalOpen,
    isQuickLinkModalOpen,
    deleteModal.isOpen,
  ]);

  // Prompt CRUD
  const handleSavePrompt = async (savedPrompt: Prompt) => {
    let updatedPrompts: Prompt[];
    const exists = prompts.some((p) => p.id === savedPrompt.id);

    if (exists) {
      updatedPrompts = prompts.map((p) => (p.id === savedPrompt.id ? savedPrompt : p));
      addToast('Prompt Updated', `Saved "${savedPrompt.title}".`);
    } else {
      updatedPrompts = [savedPrompt, ...prompts];
      addToast('Prompt Created', `Added "${savedPrompt.title}".`);
    }

    setPrompts(updatedPrompts);
    saveStoredPrompts(updatedPrompts);

    if (dbStatus?.connected) {
      apiSavePrompt(savedPrompt);
    }

    if (promptToView && promptToView.id === savedPrompt.id) {
      setPromptToView(savedPrompt);
    }
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Prompt',
      message: `Are you sure you want to delete "${prompt.title}"?`,
      onConfirm: async () => {
        const updated = prompts.filter((p) => p.id !== prompt.id);
        setPrompts(updated);
        saveStoredPrompts(updated);

        if (dbStatus?.connected) {
          apiDeletePrompt(prompt.id);
        }

        addToast('Prompt Deleted', `Removed "${prompt.title}".`, 'info');
        if (promptToView?.id === prompt.id) {
          setIsDetailModalOpen(false);
          setPromptToView(null);
        }
      },
    });
  };

  const handleDuplicatePrompt = async (prompt: Prompt) => {
    const duplicated: Prompt = {
      ...prompt,
      id: `prompt-${Date.now()}`,
      title: `${prompt.title} (Copy)`,
      copyCount: 0,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...prompts];
    setPrompts(updated);
    saveStoredPrompts(updated);

    if (dbStatus?.connected) {
      apiSavePrompt(duplicated);
    }

    addToast('Prompt Duplicated', `Created copy of "${prompt.title}".`);
  };

  const handleToggleFavorite = async (id: string) => {
    const updated = prompts.map((p) => {
      if (p.id === id) {
        const nextFav = !p.isFavorite;
        const updatedItem = { ...p, isFavorite: nextFav };
        if (dbStatus?.connected) {
          apiSavePrompt(updatedItem);
        }
        addToast(
          nextFav ? 'Added to Favorites' : 'Removed from Favorites',
          `"${p.title}"`,
          'info'
        );
        return updatedItem;
      }
      return p;
    });
    setPrompts(updated);
    saveStoredPrompts(updated);

    if (promptToView && promptToView.id === id) {
      setPromptToView({ ...promptToView, isFavorite: !promptToView.isFavorite });
    }
  };

  const handleCopyPrompt = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const updated = prompts.map((p) => {
        if (p.title === title) {
          const item = { ...p, copyCount: (p.copyCount || 0) + 1 };
          if (dbStatus?.connected) {
            apiSavePrompt(item);
          }
          return item;
        }
        return p;
      });
      setPrompts(updated);
      saveStoredPrompts(updated);
      addToast('Copied to Clipboard', `Prompt is ready to paste.`, 'success');
    } catch {
      addToast('Copy Failed', 'Please grant clipboard permissions.', 'error');
    }
  };

  // Category CRUD
  const handleSaveCategory = async (savedCategory: Category) => {
    let updatedCategories: Category[];
    const exists = categories.some((c) => c.id === savedCategory.id);

    if (exists) {
      updatedCategories = categories.map((c) =>
        c.id === savedCategory.id ? savedCategory : c
      );
      addToast('Category Updated', `Saved "${savedCategory.name}".`);
    } else {
      updatedCategories = [...categories, savedCategory];
      addToast('Category Created', `Created "${savedCategory.name}".`);
    }

    setCategories(updatedCategories);
    saveStoredCategories(updatedCategories);

    if (dbStatus?.connected) {
      apiSaveCategory(savedCategory);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    const count = prompts.filter((p) => p.categoryId === category.id).length;
    const message =
      count > 0
        ? `"${category.name}" contains ${count} prompt(s). Deleting this category will reassign those prompts to default. Proceed?`
        : `Are you sure you want to delete category "${category.name}"?`;

    setDeleteModal({
      isOpen: true,
      title: 'Delete Category',
      message,
      onConfirm: async () => {
        const updatedCats = categories.filter((c) => c.id !== category.id);
        setCategories(updatedCats);
        saveStoredCategories(updatedCats);

        if (dbStatus?.connected) {
          apiDeleteCategory(category.id);
        }

        if (count > 0) {
          const fallbackCatId = updatedCats[0]?.id || 'general';
          const updatedPrompts = prompts.map((p) => {
            if (p.categoryId === category.id) {
              const updatedItem = { ...p, categoryId: fallbackCatId };
              if (dbStatus?.connected) {
                apiSavePrompt(updatedItem);
              }
              return updatedItem;
            }
            return p;
          });
          setPrompts(updatedPrompts);
          saveStoredPrompts(updatedPrompts);
        }

        if (selectedCategory === category.id) {
          setSelectedCategory(null);
        }
        addToast('Category Deleted', `Removed "${category.name}".`, 'info');
      },
    });
  };

  // Quick Links CRUD
  const handleSaveQuickLink = async (savedLink: QuickToolLink) => {
    let updated: QuickToolLink[];
    const exists = quickLinks.some((l) => l.id === savedLink.id);
    if (exists) {
      updated = quickLinks.map((l) => (l.id === savedLink.id ? savedLink : l));
      addToast('Link Updated', `Saved "${savedLink.name}".`);
    } else {
      updated = [...quickLinks, savedLink];
      addToast('Link Added', `Saved "${savedLink.name}".`);
    }
    setQuickLinks(updated);
    saveStoredQuickLinks(updated);

    if (dbStatus?.connected) {
      apiSaveQuickLink(savedLink);
    }
  };

  const handleDeleteQuickLink = async (id: string) => {
    const updated = quickLinks.filter((l) => l.id !== id);
    setQuickLinks(updated);
    saveStoredQuickLinks(updated);

    if (dbStatus?.connected) {
      apiDeleteQuickLink(id);
    }

    addToast('Link Removed', '', 'info');
  };

  // Export / Import / Reset
  const handleExportVault = () => {
    const jsonStr = exportVaultJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `box-prompt-vault-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Vault Exported', 'JSON backup file downloaded.', 'success');
  };

  const handleImportFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const result = importVaultJSON(content);
      if (result.success) {
        const cats = getStoredCategories();
        const pList = getStoredPrompts();
        const qLinks = getStoredQuickLinks();

        setCategories(cats);
        setPrompts(pList);
        setQuickLinks(qLinks);

        // Sync imported items to MongoDB
        if (dbStatus?.connected) {
          cats.forEach((c) => apiSaveCategory(c));
          pList.forEach((p) => apiSavePrompt(p));
          qLinks.forEach((l) => apiSaveQuickLink(l));
        }

        addToast('Import Successful', result.message, 'success');
      } else {
        addToast('Import Failed', result.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearVault = () => {
    setDeleteModal({
      isOpen: true,
      title: 'Clear Vault',
      message: 'Are you sure you want to clear all prompts, categories, and links?',
      onConfirm: async () => {
        clearVaultData();
        setCategories([]);
        setPrompts([]);
        setQuickLinks([]);
        setSelectedCategory(null);
        setSelectedModel('ALL');
        setOnlyFavorites(false);
        setSelectedTag(null);

        if (dbStatus?.connected) {
          await apiClearDatabase();
        }

        addToast('Vault Cleared', 'All items removed.', 'info');
      },
    });
  };

  // Category counts
  const promptCountByCategory = useMemo(() => {
    const dict: Record<string, number> = {};
    prompts.forEach((p) => {
      dict[p.categoryId] = (dict[p.categoryId] || 0) + 1;
    });
    return dict;
  }, [prompts]);

  // Filtered and Sorted Prompts
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        if (selectedCategory && p.categoryId !== selectedCategory) {
          return false;
        }
        if (onlyFavorites && !p.isFavorite) {
          return false;
        }
        if (selectedModel !== 'ALL' && p.model !== selectedModel) {
          return false;
        }
        if (selectedTag && !p.tags?.includes(selectedTag)) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchContent = p.content.toLowerCase().includes(q);
          const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
          const matchLinks = p.links?.some(
            (l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)
          );
          const categoryName = categories.find((c) => c.id === p.categoryId)?.name.toLowerCase() || '';
          const matchCategory = categoryName.includes(q);

          if (!matchTitle && !matchDesc && !matchContent && !matchTag && !matchLinks && !matchCategory) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.copyCount || 0) - (a.copyCount || 0);
        }
        if (sortBy === 'alpha') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [prompts, selectedCategory, onlyFavorites, selectedModel, selectedTag, searchQuery, sortBy, categories]);

  const totalCopies = useMemo(
    () => prompts.reduce((acc, p) => acc + (p.copyCount || 0), 0),
    [prompts]
  );
  const totalLinks = useMemo(
    () => prompts.reduce((acc, p) => acc + (p.links?.length || 0), 0),
    [prompts]
  );
  const favoriteCount = useMemo(
    () => prompts.filter((p) => p.isFavorite).length,
    [prompts]
  );

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const activeCategoryColor = activeCategoryObj?.color?.startsWith('bg-')
    ? activeCategoryObj.color
    : 'bg-zinc-700';

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedModel !== 'ALL' ||
    onlyFavorites ||
    selectedTag !== null ||
    Boolean(searchQuery.trim());

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedModel('ALL');
    setOnlyFavorites(false);
    setSelectedTag(null);
    setSearchQuery('');
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white font-mono text-xs">
        Loading BOX Vault...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar with DB connection indicator */}
      <Sidebar
        categories={categories}
        quickLinks={quickLinks}
        selectedCategory={selectedCategory}
        selectedModel={selectedModel}
        onlyFavorites={onlyFavorites}
        promptCountByCategory={promptCountByCategory}
        totalPromptsCount={prompts.length}
        favoritePromptsCount={favoriteCount}
        dbStatus={dbStatus}
        onSelectCategory={(id) => setSelectedCategory(id)}
        onSelectModel={(model) => setSelectedModel(model)}
        onToggleOnlyFavorites={() => setOnlyFavorites(!onlyFavorites)}
        onOpenCreateCategory={() => {
          setCategoryToEdit(null);
          setIsCategoryModalOpen(true);
        }}
        onOpenEditCategory={(cat) => {
          setCategoryToEdit(cat);
          setIsCategoryModalOpen(true);
        }}
        onDeleteCategory={handleDeleteCategory}
        onOpenAddQuickLink={() => {
          setQuickLinkToEdit(null);
          setIsQuickLinkModalOpen(true);
        }}
        onDeleteQuickLink={handleDeleteQuickLink}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          sortBy={sortBy}
          onChangeSortBy={setSortBy}
          onOpenCreatePrompt={() => {
            setPromptToEdit(null);
            setIsPromptModalOpen(true);
          }}
          onExport={handleExportVault}
          onImportFile={handleImportFile}
          onResetDemoData={handleClearVault}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dashboard Main View */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-5">
          {/* Top Analytics / Stats */}
          <StatsBar
            totalPrompts={prompts.length}
            totalCategories={categories.length}
            totalLinks={totalLinks}
            totalCopies={totalCopies}
            totalFavorites={favoriteCount}
          />

          {/* Active View / Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              {activeCategoryObj ? (
                <div className={`p-2 rounded-lg ${activeCategoryColor} text-white`}>
                  <CategoryIcon name={activeCategoryObj.icon} className="w-4 h-4" />
                </div>
              ) : onlyFavorites ? (
                <div className="p-2 rounded-lg bg-red-600 text-white">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200">
                  <LayoutGrid className="w-4 h-4" />
                </div>
              )}

              <div>
                <h1 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  {onlyFavorites
                    ? 'Favorite Prompts'
                    : activeCategoryObj
                    ? activeCategoryObj.name
                    : searchQuery
                    ? `Search results for "${searchQuery}"`
                    : 'All Prompts'}
                  <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    {filteredPrompts.length}
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  {activeCategoryObj?.description ||
                    (onlyFavorites
                      ? 'Starred prompts'
                      : 'Organize and manage your prompt library')}
                </p>
              </div>
            </div>

            {/* Active Filter Indicators */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-300 border border-zinc-800">
                    <span>Category: {activeCategoryObj?.name}</span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedModel !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-300 border border-zinc-800">
                    <span>Model: {selectedModel}</span>
                    <button
                      onClick={() => setSelectedModel('ALL')}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {onlyFavorites && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-300 border border-zinc-800">
                    <span>Favorites</span>
                    <button
                      onClick={() => setOnlyFavorites(false)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-300 border border-zinc-800">
                    <span>Query: "{searchQuery}"</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-xs text-zinc-400 hover:text-white underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Prompts Cards / List */}
          {filteredPrompts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5'
                  : 'flex flex-col gap-2.5'
              }
            >
              {filteredPrompts.map((prompt) => {
                const category = categories.find((c) => c.id === prompt.categoryId);
                return (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    category={category}
                    viewMode={viewMode}
                    onCopy={handleCopyPrompt}
                    onOpenDetail={(p) => {
                      setPromptToView(p);
                      setIsDetailModalOpen(true);
                    }}
                    onEdit={(p) => {
                      setPromptToEdit(p);
                      setIsPromptModalOpen(true);
                    }}
                    onDuplicate={handleDuplicatePrompt}
                    onDelete={handleDeletePrompt}
                    onToggleFavorite={handleToggleFavorite}
                  />
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
              <div className="p-3 rounded-lg bg-zinc-800 text-zinc-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">No Prompts in Vault</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {hasActiveFilters
                    ? "No prompts match your active search or filter criteria."
                    : "Your library is ready. Create your first category or prompt to get started."}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                  >
                    Reset Filters
                  </button>
                )}
                {categories.length === 0 && (
                  <button
                    onClick={() => {
                      setCategoryToEdit(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition flex items-center gap-1"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Create Category</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setPromptToEdit(null);
                    setIsPromptModalOpen(true);
                  }}
                  className="px-4 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Prompt</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <PromptModal
        isOpen={isPromptModalOpen}
        promptToEdit={promptToEdit}
        categories={categories}
        initialCategoryId={selectedCategory}
        onClose={() => {
          setIsPromptModalOpen(false);
          setPromptToEdit(null);
        }}
        onSave={handleSavePrompt}
        onOpenCreateCategory={() => {
          setCategoryToEdit(null);
          setIsCategoryModalOpen(true);
        }}
      />

      <PromptDetailModal
        isOpen={isDetailModalOpen}
        prompt={promptToView}
        category={categories.find((c) => c.id === promptToView?.categoryId)}
        onClose={() => {
          setIsDetailModalOpen(false);
          setPromptToView(null);
        }}
        onCopy={handleCopyPrompt}
        onEdit={(p) => {
          setIsDetailModalOpen(false);
          setPromptToEdit(p);
          setIsPromptModalOpen(true);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        categoryToEdit={categoryToEdit}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCategory}
      />

      <QuickLinkModal
        isOpen={isQuickLinkModalOpen}
        linkToEdit={quickLinkToEdit}
        onClose={() => {
          setIsQuickLinkModalOpen(false);
          setQuickLinkToEdit(null);
        }}
        onSave={handleSaveQuickLink}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={deleteModal.onConfirm}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
