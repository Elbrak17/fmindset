'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isQuizPage = pathname === '/assessment/quiz';
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🧠</span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FMindset
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard' 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/journal"
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard/journal' 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
              }`}
            >
              Journal
            </Link>
            <Link 
              href="/community"
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith('/community') 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
              }`}
            >
              Community
            </Link>
            <Link 
              href="/settings"
              className={`text-sm font-medium transition-colors ${
                pathname === '/settings' 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
              }`}
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            {!isQuizPage && (
              <Link 
                href="/assessment/quiz"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Start Assessment
              </Link>
            )}
          </nav>

          {/* Mobile */}
          <div className="md:hidden">
            {!isQuizPage && (
              <Link 
                href="/assessment/quiz"
                className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
              >
                Start
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
