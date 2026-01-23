"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, ShieldCheck } from "lucide-react";

export function InitialTransition({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    // Check the attribute set by the layout script for zero-flash detection
    const isPreloaderActive = document.documentElement.getAttribute('data-preloader') === 'active';
    
    if (isPreloaderActive) {
      setIsVisible(true);
    }
    setIsMounted(true);
  }, []);

  const [showChildren, setShowChildren] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Aggressive scroll lock when preloader starts
      const root = document.documentElement;
      const body = document.body;
      
      root.style.overflow = 'hidden';
      root.style.scrollbarWidth = 'none';
      body.style.overflow = 'hidden';
      body.style.height = '100dvh';

      const timer = setTimeout(() => {
        setIsVisible(false);
        
        // Wait for exit animation to complete (1s duration + 0.1s delay) before restoring
        setTimeout(() => {
          root.style.overflow = '';
          root.style.scrollbarWidth = '';
          body.style.overflow = '';
          body.style.height = '';
          document.documentElement.removeAttribute('data-preloader');
          setShowChildren(true);
        }, 1100);
      }, 3200);
      
      return () => clearTimeout(timer);
    } else {
      // If we are not showing preloader (e.g. standard navigation where layout is already mounted)
      // or if it was already cleared
      if (!document.documentElement.hasAttribute('data-preloader')) {
        setShowChildren(true);
      }
    }
  }, [isVisible]);

  // Handle Hydration cleanly
  if (!isMounted) return <>{children}</>;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="global-preloader"
            initial={{ opacity: 1 }}
            exit={{ 
              y: "-100%",
              transition: { 
                duration: 1, 
                ease: [0.7, 0, 0.3, 1], // Luxury slide ease
                delay: 0.1
              } 
            }}
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-indigo-600 font-syne touch-none select-none pointer-events-auto overflow-hidden"
          >
            <div className="relative flex flex-col items-center">
              {/* Logo Revelation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 240, 
                  damping: 18,
                  delay: 0.2
                }}
                className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-10"
              >
                <Database className="w-12 h-12 text-indigo-600" />
              </motion.div>

              {/* Staggered Branding */}
              <div className="flex overflow-hidden px-4">
                {"GENBOSS".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: "easeOut", 
                      delay: 0.5 + (i * 0.1) 
                    }}
                    className="text-6xl md:text-8xl font-black text-white tracking-tighter"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Progress Detail */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 1.5 }}
                className="mt-10 flex flex-col items-center gap-4"
              >
                <p className="text-white font-outfit font-bold tracking-[0.4em] uppercase text-[10px]">
                  Initializing Dashboard Generus System
                </p>
                <div className="h-[2px] w-40 bg-white/20 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ x: "-100%" }}
                     animate={{ x: "100%" }}
                     transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                     className="h-full w-1/3 bg-white"
                   />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
         Content reveals only after preloader exits. 
         This ensures Framer Motion staggered reveals start exactly when visible.
      */}
      {showChildren && children}
    </>
  );
}
