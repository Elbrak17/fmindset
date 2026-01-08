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
