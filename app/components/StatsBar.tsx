'use client';

import React from 'react';
import { Layers, Folder, Globe, Copy } from 'lucide-react';

interface StatsBarProps {
  totalPrompts: number;
  totalCategories: number;
  totalLinks: number;
  totalCopies: number;
  totalFavorites: number;
}

const StatsBarComponent: React.FC<StatsBarProps> = ({
  totalPrompts,
  totalCategories,
  totalLinks,
  totalCopies,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {/* Prompts */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-zinc-400 font-medium">Prompts</p>
          <p className="text-lg font-semibold text-white font-mono mt-0.5">{totalPrompts}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-400">
          <Layers className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Categories */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-zinc-400 font-medium">Categories</p>
          <p className="text-lg font-semibold text-white font-mono mt-0.5">{totalCategories}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-400">
          <Folder className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Links */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-zinc-400 font-medium">Links</p>
          <p className="text-lg font-semibold text-white font-mono mt-0.5">{totalLinks}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-400">
          <Globe className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Copies */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-zinc-400 font-medium">Copies</p>
          <p className="text-lg font-semibold text-white font-mono mt-0.5">{totalCopies}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-400">
          <Copy className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export const StatsBar = React.memo(StatsBarComponent);
