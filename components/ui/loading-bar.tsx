"use client";

import { useEffect, useState } from "react";

export function LoadingBar({ isPending }: { isPending: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPending) {
      setTimeout(() => setProgress(10), 0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + (90 - prev) * 0.1;
        });
      }, 100);
    } else {
      setTimeout(() => setProgress(100), 0);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => clearInterval(interval);
  }, [isPending]);

  if (progress === 0 || progress === 100) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent overflow-hidden">
      <div 
        className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
