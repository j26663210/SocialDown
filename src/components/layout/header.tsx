import React from 'react';
import { Download, History, Settings, FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Download size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight">SocialDown</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('download')}
            className={cn("transition-colors hover:text-zinc-900", activeTab === 'download' ? "text-zinc-900" : "text-zinc-500")}
          >
            下載 (Download)
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn("transition-colors hover:text-zinc-900", activeTab === 'history' ? "text-zinc-900" : "text-zinc-500")}
          >
            紀錄 (History)
          </button>
          <button 
            onClick={() => setActiveTab('changelog')}
            className={cn("transition-colors hover:text-zinc-900", activeTab === 'changelog' ? "text-zinc-900" : "text-zinc-500")}
          >
            更新日誌 (Changelog)
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-zinc-500 hover:text-zinc-900">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
