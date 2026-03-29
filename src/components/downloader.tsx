import React, { useState, useEffect } from 'react';
import { Download, Link as LinkIcon, FileAudio, FileVideo, Loader2, CheckCircle2, AlertCircle, Youtube, Instagram, Facebook, AtSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';
import { Progress } from '@/src/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';

type DownloadStatus = 'idle' | 'analyzing' | 'downloading' | 'success' | 'error';
type Platform = 'youtube' | 'facebook' | 'instagram' | 'threads' | 'unknown';

export function Downloader() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('1080p');
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [result, setResult] = useState<any>(null);

  // Auto-detect platform
  useEffect(() => {
    if (!url) {
      setPlatform('unknown');
      return;
    }
    
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      setPlatform('youtube');
    } else if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) {
      setPlatform('facebook');
    } else if (lowerUrl.includes('instagram.com')) {
      setPlatform('instagram');
    } else if (lowerUrl.includes('threads.net')) {
      setPlatform('threads');
    } else {
      setPlatform('unknown');
    }
  }, [url]);

  const handleDownload = async () => {
    if (!url) {
      setErrorMsg('請輸入有效的影片網址 (Please enter a valid URL)');
      setStatus('error');
      return;
    }

    setStatus('analyzing');
    setProgress(0);
    setResult(null);
    
    // Simulate analyzing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStatus('downloading');
    
    // Simulate download progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, quality, platform })
      });
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`伺服器錯誤 (Server Error): ${response.status} ${response.statusText}`);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Download initiation failed');
      }

      const { jobId, progressUrl, title, thumbnail } = data.data;
      
      // Start polling
      let pollCount = 0;
      const maxPolls = 80; // 80 * 1.5s = 120s timeout
      
      const pollProgress = async () => {
        try {
          pollCount++;
          if (pollCount > maxPolls) {
            throw new Error("Download timed out. The video might be unavailable or too long.");
          }
          
          const progressRes = await fetch(progressUrl);
          const progressData = await progressRes.json();
          
          if (progressData.success === 1 && progressData.download_url) {
            clearInterval(interval);
            setProgress(100);
            setResult({
              title: title,
              thumbnail: thumbnail,
              downloadUrl: progressData.download_url,
              format,
              quality
            });
            setStatus('success');
            
            // Save to history
            const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
            history.unshift({
              id: Date.now().toString(),
              url,
              platform,
              format,
              quality,
              title: title,
              date: new Date().toISOString()
            });
            localStorage.setItem('downloadHistory', JSON.stringify(history.slice(0, 50)));
          } else if (progressData.success === 0) {
            // Update progress
            const currentProgress = progressData.progress ? progressData.progress / 10 : 0;
            setProgress(Math.max(10, currentProgress)); // Keep at least 10% from the fake progress
            setTimeout(pollProgress, 1500);
          } else {
            throw new Error(progressData.text || "Download failed during processing");
          }
        } catch (e: any) {
          clearInterval(interval);
          setErrorMsg(e.message || "Failed to check download progress");
          setStatus('error');
        }
      };

      pollProgress();

    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || '發生錯誤，請稍後再試 (An error occurred)');
      setStatus('error');
    }
  };

  const PlatformIcon = () => {
    switch (platform) {
      case 'youtube': return <Youtube className="text-red-500" />;
      case 'facebook': return <Facebook className="text-blue-600" />;
      case 'instagram': return <Instagram className="text-pink-600" />;
      case 'threads': return <AtSign className="text-black" />;
      default: return <LinkIcon className="text-zinc-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          社群媒體影片下載器
        </h1>
        <p className="text-lg text-zinc-500">
          支援 YouTube, Facebook, Instagram, Threads 等平台，輕鬆轉換為 MP4 或 MP3。
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>貼上影片網址 (Paste Video URL)</CardTitle>
          <CardDescription>
            將您想下載的影片連結貼在下方
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <div className="absolute left-3 top-3 flex items-center justify-center">
              <PlatformIcon />
            </div>
            <Input 
              placeholder="https://www.youtube.com/watch?v=..." 
              className="pl-12 h-12 text-base"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={status === 'analyzing' || status === 'downloading'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">格式 (Format)</label>
              <div className="flex gap-2">
                <Button 
                  variant={format === 'mp4' ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => setFormat('mp4')}
                  disabled={status === 'analyzing' || status === 'downloading'}
                >
                  <FileVideo className="mr-2 h-4 w-4" /> MP4
                </Button>
                <Button 
                  variant={format === 'mp3' ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => setFormat('mp3')}
                  disabled={status === 'analyzing' || status === 'downloading'}
                >
                  <FileAudio className="mr-2 h-4 w-4" /> MP3
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">畫質/音質 (Quality)</label>
              <Select 
                value={quality} 
                onChange={(e) => setQuality(e.target.value)}
                disabled={status === 'analyzing' || status === 'downloading'}
              >
                {format === 'mp4' ? (
                  <>
                    <option value="4k">4K (2160p)</option>
                    <option value="1080p">HD (1080p)</option>
                    <option value="720p">SD (720p)</option>
                    <option value="480p">Low (480p)</option>
                  </>
                ) : (
                  <>
                    <option value="320kbps">320 kbps (High)</option>
                    <option value="256kbps">256 kbps (Medium)</option>
                    <option value="128kbps">128 kbps (Low)</option>
                  </>
                )}
              </Select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(status === 'analyzing' || status === 'downloading') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="flex justify-between text-sm font-medium">
                  <span className="flex items-center text-zinc-600">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {status === 'analyzing' ? '正在解析網址 (Analyzing URL)...' : '正在下載與轉檔 (Downloading & Converting)...'}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center text-red-600 bg-red-50 p-3 rounded-md text-sm overflow-hidden"
              >
                <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                {errorMsg}
              </motion.div>
            )}

            {status === 'success' && result && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="h-20 w-32 bg-zinc-200 rounded-md overflow-hidden flex-shrink-0 relative">
                    <img src={result.thumbnail} alt="Thumbnail" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <CheckCircle2 className="text-white h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-900 truncate">{result.title}</h4>
                    <p className="text-sm text-zinc-500 mt-1">
                      {format.toUpperCase()} • {quality}
                    </p>
                    <Button className="mt-3 w-full sm:w-auto" asChild>
                      <a href={result.downloadUrl} download>
                        <Download className="mr-2 h-4 w-4" /> 下載檔案 (Download File)
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleDownload}
            disabled={status === 'analyzing' || status === 'downloading' || !url}
          >
            {status === 'analyzing' || status === 'downloading' ? (
              <>處理中 (Processing)...</>
            ) : (
              <>開始下載 (Start Download)</>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm flex flex-col items-center justify-center gap-2">
          <Youtube className="h-8 w-8 text-red-500" />
          <span className="text-sm font-medium">YouTube</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm flex flex-col items-center justify-center gap-2">
          <Facebook className="h-8 w-8 text-blue-600" />
          <span className="text-sm font-medium">Facebook</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm flex flex-col items-center justify-center gap-2">
          <Instagram className="h-8 w-8 text-pink-600" />
          <span className="text-sm font-medium">Instagram</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm flex flex-col items-center justify-center gap-2">
          <AtSign className="h-8 w-8 text-black" />
          <span className="text-sm font-medium">Threads</span>
        </div>
      </div>
    </div>
  );
}
