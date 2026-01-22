"use client";

import { useState, useEffect } from 'react';
import { Menu, X, Home, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <nav className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
               <div className="bg-indigo-600 rounded-xl p-1.5 shadow-sm">
                  <Home className="h-4 w-4 text-white" />
               </div>
               <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                  Dashboard Generus Bogsel
               </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Dashboard
                </Link>
                <Link
                  href="/summary"
                  className="px-4 py-2 text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Summary
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (Overlay + Panel) */}
      <div className={`fixed inset-0 z-50 transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`}>
          {/* Overlay - click to close */}
          <div 
            className={`fixed inset-0 bg-slate-900/10 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
            onClick={toggleMenu}
          />
          
          {/* Sidebar Content */}
          <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-slate-950 shadow-xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full transform transition-transform duration-300">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
                 <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                     <X className="h-5 w-5 text-slate-500" />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                 <Link
                    href="/"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                 >
                    <Home className="h-4 w-4" />
                    Dashboard
                 </Link>
                 <Link
                    href="/summary"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                 >
                    <BarChart3 className="h-4 w-4" />
                    Summary
                 </Link>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 text-center">
                      &copy; 2026 Dashboard Generus Bogsel
                  </p>
              </div>
          </div>
      </div>
    </>
  );
}
