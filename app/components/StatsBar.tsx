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

export const StatsBar: React.FC<StatsBarProps> = ({
  totalPrompts,
  totalCategories,
  totalLinks,
  totalCopies,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {/* Prompts Count */}
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Total Prompts
          </p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{totalPrompts}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {/* Categories */}
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Categories
          </p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{totalCategories}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
          <Folder className="w-4 h-4" />
        </div>
      </div>

      {/* Website Links */}
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Attached Links
          </p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{totalLinks}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
          <Globe className="w-4 h-4" />
        </div>
      </div>

      {/* Total Copies */}
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Times Copied
          </p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{totalCopies}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
          <Copy className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
