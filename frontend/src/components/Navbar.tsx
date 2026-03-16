'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthContext';
import { 
  BookOpen, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  User as UserIcon,
  ChevronDown,
  Menu,
  Github
} from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-all">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CodeAtlas<span className="text-indigo-400 ml-3">AI</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                href="/explore" 
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
              >
                Explore
              </Link>
              <Link 
                href="/security" 
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
              >
                Security
              </Link>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/Pragyat-Nikunj/CodeAtlas"
              target="_blank"
              className="hidden sm:flex p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>

            <div className="h-6 w-px bg-slate-800 mx-2 hidden sm:block"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard" 
                  className="hidden md:flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all"
                >
                  <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                  Dashboard
                </Link>

                {/* User Profile Dropdown Simulation */}
                <div className="relative flex items-center gap-2 pl-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border border-white/10">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button 
              className="flex md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content (Simplified) */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 rounded-md text-slate-300 hover:bg-slate-900 hover:text-white">Dashboard</Link>
          <Link href="/explore" className="block px-4 py-3 rounded-md text-slate-300 hover:bg-slate-900 hover:text-white">Explore Projects</Link>
          {user && (
            <button 
              onClick={() => signOut()} 
              className="w-full text-left px-4 py-3 rounded-md text-red-400 hover:bg-red-900/10"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}