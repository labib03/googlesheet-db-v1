"use client";

import { useState, useEffect } from 'react';
import { Menu, X, Home, BarChart3, LogIn, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';
import { Button } from './ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

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

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <nav className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
               <div className="bg-indigo-600 rounded-xl p-1.5 shadow-sm group-hover:scale-110 transition-transform">
                  <Home className="h-4 w-4 text-white" />
               </div>
               <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white hidden sm:inline-block">
                  Dashboard Bogsel
               </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-semibold transition-colors text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Dashboard
                </Link>
                <Link
                  href="/summary"
                  className="px-4 py-2 text-sm font-semibold transition-colors text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Summary
                </Link>
                {session && (
                  <Link
                    href="/admin-restricted"
                    className="px-4 py-2 text-sm font-semibold transition-colors text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </div>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

              {status === "authenticated" ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
                    <div className="w-6 h-6 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {session.user?.name}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9 px-5 shadow-lg shadow-indigo-100 dark:shadow-none">
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login Admin
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              {status === "authenticated" && (
                <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
              )}
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
          <div className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-slate-950 shadow-xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full transform transition-transform duration-300">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                 <div className="flex flex-col">
                   <span className="font-bold text-lg text-slate-900 dark:text-white font-syne">Menu Navigasi</span>
                   {session && (
                     <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold mt-0.5">
                       Logged as {session.user?.name}
                     </span>
                   )}
                 </div>
                 <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
                     <X className="h-5 w-5 text-slate-500" />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                 <Link
                    href="/"
                    onClick={toggleMenu}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold transition-all active:scale-95"
                 >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                      <Home className="h-4 w-4" />
                    </div>
                    Dashboard
                 </Link>
                 <Link
                    href="/summary"
                    onClick={toggleMenu}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold transition-all active:scale-95"
                 >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    Summary
                 </Link>
                 {session && (
                   <Link
                      href="/admin-restricted"
                      onClick={toggleMenu}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold transition-all active:scale-95"
                   >
                      <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-600">
                        <Settings className="h-4 w-4" />
                      </div>
                      Admin Panel
                   </Link>
                 )}
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  {status === "authenticated" ? (
                    <Button 
                      variant="destructive" 
                      className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-rose-100 dark:shadow-none"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout Sekarang
                    </Button>
                  ) : (
                    <Button 
                      className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none"
                      asChild
                    >
                      <Link href="/login" onClick={toggleMenu}>
                        <LogIn className="w-4 h-4" />
                        Masuk Admin
                      </Link>
                    </Button>
                  )}
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium">
                      &copy; 2026 Generus Bogsel
                  </p>
              </div>
          </div>
      </div>
    </>
  );
}
