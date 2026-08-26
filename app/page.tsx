'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Heart,
  X,
  LayoutGrid,
  List,
  FolderPlus,
  Globe2,
  Lock,
  Sparkles,
  LogIn
} from 'lucide-react';
import { useUser, useClerk, SignInButton } from '@clerk/nextjs';
import {
  Prompt,
  Category,
  QuickToolLink,
  ToastMessage,
  VaultSpace
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
  apiCreatePrompt,
  apiDeletePrompt,
  apiToggleLikePrompt,
  apiFetchCategories,
  apiSaveCategory,
  apiDeleteCategory,
  apiFetchQuickLinks,
  apiSaveQuickLink,
  apiToggleLikeQuickLink,
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
import { DeveloperModal } from './components/DeveloperModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ToastContainer } from './components/Toast';
import { CategoryIcon } from './components/CategoryIcon';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  const [activeSpace, setActiveSpace] = useState<VaultSpace>('public');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickToolLink[]>([]);
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alpha'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [promptToView, setPromptToView] = useState<Prompt | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
  const [quickLinkToEdit, setQuickLinkToEdit] = useState<QuickToolLink | null>(null);

  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const requireAuth = useCallback(
    (actionName: string = 'perform this action'): boolean => {
      if (!isSignedIn) {
        addToast('Sign In Required', `Please sign in to ${actionName}.`, 'info');
        openSignIn();
        return false;
      }
      return true;
    },
    [isSignedIn, openSignIn, addToast]
  );

  // Load data according to activeSpace & auth status
  const loadDataForSpace = useCallback(
    async (space: VaultSpace) => {
      try {
        const status = await checkDBStatus();
        setDbStatus(status);

        if (status.connected) {
          const [remotePrompts, remoteCats, remoteLinks] = await Promise.all([
            apiFetchPrompts(space),
            apiFetchCategories(space),
            apiFetchQuickLinks(space),
          ]);

          if (remoteCats) {
            setCategories(remoteCats);
            if (space === 'public') saveStoredCategories(remoteCats);
          }
          if (remotePrompts) {
            setPrompts(remotePrompts);
            if (space === 'public') saveStoredPrompts(remotePrompts);
          }
          if (remoteLinks) {
            setQuickLinks(remoteLinks);
            if (space === 'public') saveStoredQuickLinks(remoteLinks);
          }
        } else {
          // Fallback to local storage
          setCategories(getStoredCategories());
          setPrompts(getStoredPrompts());
          setQuickLinks(getStoredQuickLinks());
        }
      } catch {
        setCategories(getStoredCategories());
        setPrompts(getStoredPrompts());
        setQuickLinks(getStoredQuickLinks());
      } finally {
        setIsLoaded(true);
      }
    },
    []
  );

  useEffect(() => {
    loadDataForSpace(activeSpace);
  }, [activeSpace, isSignedIn, loadDataForSpace]);

  // Deep-linking: Automatically open shared prompt if ?id= is in the URL
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded && prompts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const promptId = params.get('id') || params.get('prompt');
      if (promptId) {
        const found = prompts.find((p) => p.id === promptId);
        if (found) {
          setPromptToView(found);
          setIsDetailModalOpen(true);
        }
      }
    }
  }, [isLoaded, prompts]);

  // Space switcher handler
  const handleChangeSpace = (newSpace: VaultSpace) => {
    if (newSpace === 'personal' && !isSignedIn) {
      addToast('Sign In Required', 'Please sign in to access your Personal Space.', 'info');
      openSignIn();
      return;
    }
    setActiveSpace(newSpace);
    setSelectedCategory(null);
    setOnlyFavorites(false);
  };

  // Keyboard shortcut (N for new prompt)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setPromptToEdit(null);
        setIsPromptModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save prompt (Public: no auth needed, Personal: auth needed)
  const handleSavePrompt = async (savedPrompt: Prompt) => {
    const isSavingAsPublic = savedPrompt.isPublic !== false;

    if (!isSavingAsPublic && !isSignedIn) {
      if (!requireAuth('save prompts to Personal Space')) return;
    }

    let updatedPrompts: Prompt[];
    const exists = prompts.some((p) => p.id === savedPrompt.id);

    if (exists) {
      updatedPrompts = prompts.map((p) => (p.id === savedPrompt.id ? savedPrompt : p));
      addToast('Prompt Updated', `Saved "${savedPrompt.title}".`);
      if (dbStatus?.connected) {
        apiSavePrompt(savedPrompt);
      }
    } else {
      updatedPrompts = [savedPrompt, ...prompts];
      addToast(
        isSavingAsPublic ? 'Public Prompt Published' : 'Saved to Personal Space',
        `"${savedPrompt.title}" has been added to ${isSavingAsPublic ? 'the Public Vault' : 'your Personal Space'}.`
      );
      if (dbStatus?.connected) {
        apiCreatePrompt(savedPrompt);
      }
    }

    setPrompts(updatedPrompts);
    if (activeSpace === 'public') {
      saveStoredPrompts(updatedPrompts);
    }

    if (promptToView && promptToView.id === savedPrompt.id) {
      setPromptToView(savedPrompt);
    }
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    if (prompt.isPublic === false && !requireAuth('delete personal prompts')) return;

    setDeleteModal({
      isOpen: true,
      title: 'Delete Prompt',
      message: `Delete "${prompt.title}"?`,
      onConfirm: async () => {
        const updated = prompts.filter((p) => p.id !== prompt.id);
        setPrompts(updated);
        if (activeSpace === 'public') {
          saveStoredPrompts(updated);
        }

        if (dbStatus?.connected) {
          apiDeletePrompt(prompt.id);
        }

        addToast('Prompt Deleted', '', 'info');
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
      isPublic: activeSpace === 'public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...prompts];
    setPrompts(updated);
    if (activeSpace === 'public') {
      saveStoredPrompts(updated);
    }

    if (dbStatus?.connected) {
      apiCreatePrompt(duplicated);
    }

    addToast('Prompt Duplicated', `Created copy in ${activeSpace === 'public' ? 'Public Vault' : 'Personal Space'}.`);
  };

  // Like & Auto-Save to Personal Space
  const handleToggleFavorite = async (id: string) => {
    const targetPrompt = prompts.find((p) => p.id === id);

    if (!isSignedIn) {
      addToast(
        'Sign In Required',
        'Sign in to save this prompt to your personal space.',
        'info'
      );
      openSignIn();
      return;
    }

    // Call API toggle
    if (dbStatus?.connected) {
      apiToggleLikePrompt(id);
    }

    const updated = prompts.map((p) => {
      if (p.id === id) {
        const nextFav = !p.isFavorite;
        const updatedItem = { ...p, isFavorite: nextFav };

        if (nextFav) {
          addToast(
            'Saved to Personal Space!',
            `"${p.title}" is now available in your Personal Space.`,
            'success'
          );
        } else {
          addToast(
            'Removed from Favorites',
            `"${p.title}"`,
            'info'
          );
        }
        return updatedItem;
      }
      return p;
    });

    setPrompts(updated);
    if (activeSpace === 'public') {
      saveStoredPrompts(updated);
    }

    if (promptToView && promptToView.id === id) {
      setPromptToView({ ...promptToView, isFavorite: !promptToView.isFavorite });
    }
  };

  // Like & Auto-Save Link to Personal Space
  const handleToggleFavoriteLink = async (id: string) => {
    const targetLink = quickLinks.find((l) => l.id === id);

    if (!isSignedIn) {
      addToast(
        'Sign In Required',
        'Sign in to save this link to your personal space.',
        'info'
      );
      openSignIn();
      return;
    }

    if (dbStatus?.connected) {
      apiToggleLikeQuickLink(id);
    }

    const updated = quickLinks.map((l) => {
      if (l.id === id) {
        const nextFav = !l.isFavorite;
        const updatedItem = { ...l, isFavorite: nextFav };

        if (nextFav) {
          addToast(
            'Saved Link to Personal Space!',
            `"${l.name}" is now saved in your Personal Space.`,
            'success'
          );
        } else {
          addToast('Removed from Favorites', `"${l.name}"`, 'info');
        }
        return updatedItem;
      }
      return l;
    });

    setQuickLinks(updated);
    if (activeSpace === 'public') {
      saveStoredQuickLinks(updated);
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
      if (activeSpace === 'public') {
        saveStoredPrompts(updated);
      }
      addToast('Copied to Clipboard', '', 'success');
    } catch {
      addToast('Copy Failed', '', 'error');
    }
  };

  const handleSharePrompt = async (prompt: Prompt, customContent?: string) => {
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(prompt.id)}`
        : '';
    const textToShare = `${prompt.title}\n\n${customContent || prompt.content}\n\nLink: ${shareUrl}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: prompt.title,
            text: `${prompt.title} - ${prompt.description || 'AI Prompt on BOX'}`,
            url: shareUrl,
          });
        } catch (err: any) {
          // user cancelled native share
        }
      }
      addToast('Prompt Link Copied!', shareUrl, 'success');
    } catch {
      addToast('Copy Link Failed', '', 'error');
    }
  };

  const handleShareApp = async () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : '';
    const shareData = {
      title: 'BOX — Prompt Library & Web Resource Vault',
      text: 'Organize and playground your AI prompts with BOX — created by DEVARAJA S G.',
      url: shareUrl,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err: any) {
          // user cancelled native share
        }
      }
      addToast('Vault Link Copied!', shareUrl, 'success');
    } catch {
      addToast('Copy Link Failed', '', 'error');
    }
  };

  const handleSaveCategory = async (savedCategory: Category) => {
    let updatedCategories: Category[];
    const exists = categories.some((c) => c.id === savedCategory.id);

    if (exists) {
      updatedCategories = categories.map((c) =>
        c.id === savedCategory.id ? savedCategory : c
      );
      addToast('Category Saved', `"${savedCategory.name}".`);
    } else {
      updatedCategories = [...categories, savedCategory];
      addToast('Category Created', `"${savedCategory.name}".`);
    }

    setCategories(updatedCategories);
    saveStoredCategories(updatedCategories);

    if (dbStatus?.connected) {
      apiSaveCategory(savedCategory);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    if (!requireAuth('delete categories')) return;

    const count = prompts.filter((p) => p.categoryId === category.id).length;
    const message =
      count > 0
        ? `"${category.name}" contains ${count} prompt(s). Delete category?`
        : `Delete category "${category.name}"?`;

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

        addToast('Category Deleted', '', 'info');
      },
    });
  };

  const handleSaveQuickLink = async (savedLink: QuickToolLink) => {
    let updatedLinks: QuickToolLink[];
    const exists = quickLinks.some((l) => l.id === savedLink.id);

    if (exists) {
      updatedLinks = quickLinks.map((l) => (l.id === savedLink.id ? savedLink : l));
      addToast('Link Updated', `"${savedLink.name}".`);
    } else {
      updatedLinks = [...quickLinks, savedLink];
      addToast('Link Added', `"${savedLink.name}".`);
    }

    setQuickLinks(updatedLinks);
    saveStoredQuickLinks(updatedLinks);

    if (dbStatus?.connected) {
      apiSaveQuickLink(savedLink);
    }
  };

  const handleDeleteQuickLink = (id: string) => {
    const link = quickLinks.find((l) => l.id === id);
    setDeleteModal({
      isOpen: true,
      title: 'Delete Link',
      message: `Delete link "${link?.name || id}"?`,
      onConfirm: async () => {
        const updated = quickLinks.filter((l) => l.id !== id);
        setQuickLinks(updated);
        saveStoredQuickLinks(updated);

        if (dbStatus?.connected) {
          apiDeleteQuickLink(id);
        }

        addToast('Link Deleted', '', 'info');
      },
    });
  };

  const handleExportVault = () => {
    try {
      const jsonString = exportVaultJSON();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `box-vault-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Vault Exported', 'Saved local JSON file.', 'success');
    } catch {
      addToast('Export Failed', 'Unable to export vault.', 'error');
    }
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const res = importVaultJSON(content);
      if (res.success) {
        setCategories(getStoredCategories());
        setPrompts(getStoredPrompts());
        setQuickLinks(getStoredQuickLinks());
        addToast('Import Successful', res.message, 'success');
      } else {
        addToast('Import Error', res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearVault = () => {
    setDeleteModal({
      isOpen: true,
      title: 'Reset Vault Data',
      message: 'This will reset all your prompts and categories. Are you sure?',
      onConfirm: async () => {
        clearVaultData();
        setPrompts([]);
        setCategories([]);
        setQuickLinks([]);
        if (dbStatus?.connected) {
          await apiClearDatabase();
        }
        addToast('Vault Reset', 'All prompts cleared.', 'info');
      },
    });
  };

  const promptCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        if (selectedCategory && p.categoryId !== selectedCategory) return false;
        if (onlyFavorites && !p.isFavorite) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchContent = p.content.toLowerCase().includes(q);
          const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
          const matchCat = categories
            .find((c) => c.id === p.categoryId)
            ?.name.toLowerCase()
            .includes(q);
          return matchTitle || matchDesc || matchContent || matchTag || matchCat;
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
  }, [prompts, selectedCategory, onlyFavorites, searchQuery, sortBy, categories]);

  const totalCopies = useMemo(
    () => prompts.reduce((acc, p) => acc + (p.copyCount || 0), 0),
    [prompts]
  );
  const totalLinks = useMemo(
    () => quickLinks.length + prompts.reduce((acc, p) => acc + (p.links?.length || 0), 0),
    [quickLinks, prompts]
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
    onlyFavorites ||
    Boolean(searchQuery.trim());

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setOnlyFavorites(false);
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
      <Sidebar
        activeSpace={activeSpace}
        onChangeSpace={handleChangeSpace}
        categories={categories}
        quickLinks={quickLinks}
        selectedCategory={selectedCategory}
        onlyFavorites={onlyFavorites}
        promptCountByCategory={promptCountByCategory}
        totalPromptsCount={prompts.length}
        favoritePromptsCount={favoriteCount}
        dbStatus={dbStatus}
        onSelectCategory={(id) => setSelectedCategory(id)}
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
        onOpenEditQuickLink={(link) => {
          setQuickLinkToEdit(link);
          setIsQuickLinkModalOpen(true);
        }}
        onDeleteQuickLink={handleDeleteQuickLink}
        onToggleFavoriteQuickLink={handleToggleFavoriteLink}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onShareApp={handleShareApp}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeSpace={activeSpace}
          onChangeSpace={handleChangeSpace}
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
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          onShareApp={handleShareApp}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-4">
          <StatsBar
            totalPrompts={prompts.length}
            totalCategories={categories.length}
            totalLinks={totalLinks}
            totalCopies={totalCopies}
            totalFavorites={favoriteCount}
          />

          {/* Header & View Mode Controls */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {activeCategoryObj ? (
                <div className={`p-1.5 rounded-md ${activeCategoryColor} text-white shrink-0`}>
                  <CategoryIcon name={activeCategoryObj.icon} className="w-3.5 h-3.5" />
                </div>
              ) : onlyFavorites ? (
                <div className="p-1.5 rounded-md bg-red-600 text-white shrink-0">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
              ) : (
                <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300 shrink-0">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </div>
              )}

              <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                {onlyFavorites
                  ? 'Favorites'
                  : activeCategoryObj
                  ? activeCategoryObj.name
                  : searchQuery
                  ? `Search: "${searchQuery}"`
                  : activeSpace === 'personal'
                  ? 'My Personal Prompts'
                  : 'Public Community Prompts'}
                <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  {filteredPrompts.length}
                </span>
              </h1>

              {/* Filter Indicators */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 ml-1">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-300 border border-zinc-800">
                      <span>{activeCategoryObj?.name}</span>
                      <button onClick={() => setSelectedCategory(null)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {onlyFavorites && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-300 border border-zinc-800">
                      <span>Favorites</span>
                      <button onClick={() => setOnlyFavorites(false)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-300 border border-zinc-800">
                      <span>"{searchQuery}"</span>
                      <button onClick={() => setSearchQuery('')} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button onClick={clearAllFilters} className="text-xs text-zinc-400 hover:text-white underline ml-1">
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* View Mode Toggle (Grid / List) */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'list' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cards Grid / List */}
          {filteredPrompts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'
                  : 'flex flex-col gap-2'
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
                    activeSpace={activeSpace}
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
                    onShare={handleSharePrompt}
                  />
                );
              })}
            </div>
          ) : (
            /* Clean Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
              <div className="p-2.5 rounded-lg bg-zinc-800/80 text-zinc-400">
                {activeSpace === 'public' ? <Globe2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <h3 className="text-sm font-semibold text-white">
                {activeSpace === 'personal'
                  ? 'No Personal Prompts Yet'
                  : 'No Public Prompts in Vault'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                {activeSpace === 'personal'
                  ? 'Create private prompts or click the heart icon on any public prompt to save it to your personal space.'
                  : 'Be the first to publish a public prompt to the community library! No login required.'}
              </p>

              <div className="flex items-center gap-2 pt-1">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={() => {
                    setPromptToEdit(null);
                    setIsPromptModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{activeSpace === 'personal' ? 'Create Private Prompt' : 'Create Public Prompt'}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <PromptModal
        isOpen={isPromptModalOpen}
        promptToEdit={promptToEdit}
        categories={categories}
        initialCategoryId={selectedCategory}
        activeSpace={activeSpace}
        isSignedIn={Boolean(isSignedIn)}
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
        activeSpace={activeSpace}
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
        onShare={handleSharePrompt}
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
        activeSpace={activeSpace}
        isSignedIn={Boolean(isSignedIn)}
        onClose={() => {
          setIsQuickLinkModalOpen(false);
          setQuickLinkToEdit(null);
        }}
        onSave={handleSaveQuickLink}
      />

      <DeveloperModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onShareApp={handleShareApp}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSuccessToast={addToast}
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
