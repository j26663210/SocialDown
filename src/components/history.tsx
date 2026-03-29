import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Trash2, Download, Clock, Youtube, Facebook, Instagram, AtSign, Link as LinkIcon } from 'lucide-react';

interface HistoryItem {
  id: string;
  url: string;
  platform: string;
  format: string;
  quality: string;
  title: string;
  date: string;
}

export function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('downloadHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('確定要清除所有下載紀錄嗎？ (Are you sure you want to clear all history?)')) {
      localStorage.removeItem('downloadHistory');
      setHistory([]);
    }
  };

  const removeItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem('downloadHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'threads': return <AtSign className="h-4 w-4 text-black" />;
      default: return <LinkIcon className="h-4 w-4 text-zinc-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">下載紀錄 (History)</h1>
          <p className="text-zinc-500 mt-2">查看您過去下載的影片與音檔。</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" onClick={clearHistory} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" /> 清除全部 (Clear All)
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="border-dashed border-2 bg-zinc-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">尚無下載紀錄</h3>
            <p className="text-sm text-zinc-500 mt-1">您下載的檔案將會顯示在這裡。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-zinc-100 flex-shrink-0">
                  {getPlatformIcon(item.platform)}
                </div>
                
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                  <h4 className="font-semibold text-zinc-900 truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 text-xs text-zinc-500">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 font-medium">
                      {item.format.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 font-medium">
                      {item.quality}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-4 w-4" /> 來源
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
