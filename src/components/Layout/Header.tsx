'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isQuizPage = pathname === '/assessment/quiz';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/journal', label: 'Journal', icon: '📝' },
    { href: '/community', label: 'Community', icon: '👥', matchPrefix: true },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (href: string, matchPrefix?: boolean) => {
    if (matchPrefix) {
      return pathname?.startsWith(href);
    }
    return pathname === href;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] border-b border-white/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="group flex items-center gap-3 text-xl font-bold transition-all duration-300"
          >
            <div className="relative">
              <span className="text-2xl lg:text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">🧠</span>
              <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="gradient-text text-xl lg:text-2xl font-extrabold tracking-tight">
              FMindset
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive(link.href, link.matchPrefix)
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </span>
                {isActive(link.href, link.matchPrefix) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
                )}
              </Link>
            ))}
            
            {!isQuizPage && (
              <Link 
                href="/assessment/quiz"
                className="ml-4 group relative px-6 py-2.5 text-sm font-semibold text-white overflow-hidden rounded-full transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] group-hover:animate-[gradient-shift_2s_ease_infinite]" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <span className="relative flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Assessment
                </span>
                <span className="absolute inset-0 rounded-full shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300" />
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            {!isQuizPage && (
              <Link 
                href="/assessment/quiz"
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25"
              >
                Start
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                isMobileMenuOpen 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'
                }`} />
                <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
                }`} />
                <span className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="py-4 space-y-1">
            {navLinks.map((link, index) => (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.href, link.matchPrefix)
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
                {isActive(link.href, link.matchPrefix) && (
                  <span className="ml-auto w-2 h-2 bg-indigo-600 rounded-full" />
                )}
              </Link>
            ))}
            {!isQuizPage && (
              <Link 
                href="/assessment/quiz"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mx-4 mt-4 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Assessment
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
