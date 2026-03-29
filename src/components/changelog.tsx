import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

const changelogData = [
  {
    version: "v1.1.0",
    date: "2026-03-29",
    changes: [
      "Implemented real metadata fetching for YouTube via oEmbed API (實作 YouTube 真實影片標題與縮圖抓取)",
      "Added generic OpenGraph metadata scraper for Facebook, Instagram, and Threads (加入 Facebook, IG, Threads 的真實標題與縮圖抓取)",
      "Enhanced backend API to process real URLs instead of mock data (強化後端 API 以處理真實網址)"
    ]
  },
  {
    version: "v1.0.1",
    date: "2026-03-29",
    changes: [
      "Fixed an issue where the 'asChild' prop was not recognized by the Button component (修復 Button 元件無法識別 'asChild' 屬性的問題)"
    ]
  },
  {
    version: "v1.0.0",
    date: "2026-03-29",
    changes: [
      "Initial Release (初始版本發布)",
      "Support for YouTube, Facebook, Instagram, and Threads video downloads (支援 YouTube, Facebook, IG, Threads 影片下載)",
      "MP4 and MP3 format conversion (支援 MP4 與 MP3 格式轉換)",
      "Download progress tracking (下載進度追蹤)",
      "Download history management (下載紀錄管理)",
      "Changelog system implemented (實作更新日誌系統)"
    ]
  }
];

export function Changelog() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">更新日誌 (Changelog)</h1>
        <p className="text-zinc-500 mt-2">追蹤 SocialDown 的最新功能與修復。</p>
      </div>

      <div className="space-y-6">
        {changelogData.map((log, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{log.version}</CardTitle>
                <span className="text-sm text-zinc-500">{log.date}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                {log.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
