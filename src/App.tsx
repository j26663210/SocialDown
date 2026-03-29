import React, { useState } from 'react';
import { Header } from '@/src/components/layout/header';
import { Downloader } from '@/src/components/downloader';
import { History } from '@/src/components/history';
import { Changelog } from '@/src/components/changelog';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('download');

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans selection:bg-zinc-200">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'download' && (
            <motion.div
              key="download"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Downloader />
            </motion.div>
          )}
          
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <History />
            </motion.div>
          )}

          {activeTab === 'changelog' && (
            <motion.div
              key="changelog"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Changelog />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="border-t border-zinc-200 bg-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          <p>SocialDown &copy; {new Date().getFullYear()} - 僅供個人學習與備份使用，請尊重版權。</p>
          <p className="mt-1">For personal learning and backup use only. Please respect copyrights.</p>
        </div>
      </footer>
    </div>
  );
}

