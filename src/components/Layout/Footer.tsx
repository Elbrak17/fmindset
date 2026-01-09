import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">🧠</span>
              <span className="text-2xl font-extrabold gradient-text">
                FMindset
              </span>
            </Link>
            <p className="mt-6 text-gray-600 leading-relaxed max-w-md">
              A scientifically-backed psychological assessment platform helping young founders 
              prevent burnout and understand their mental patterns.
            </p>
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">⚠️</span>
                <span>This is not a medical diagnosis. If you&apos;re experiencing severe distress, please contact a mental health professional.</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-gradient-to-r from-indigo-500 to-transparent" />
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { href: '/', label: 'Home' },
                { href: '/assessment/quiz', label: 'Take Assessment' },
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/dashboard/journal', label: 'Daily Journal' },
                { href: '/community', label: 'Community' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-indigo-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Crisis Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-gradient-to-r from-rose-500 to-transparent" />
              Crisis Resources
            </h3>
            <ul className="space-y-4">
              {[
                { href: 'https://988lifeline.org', label: '988 Suicide & Crisis Lifeline', icon: '🆘' },
                { href: 'https://www.crisistextline.org', label: 'Crisis Text Line', icon: '💬' },
                { href: 'https://findahelpline.com', label: 'Find a Helpline (Global)', icon: '🌍' },
              ].map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                  >
                    <span className="text-sm opacity-60 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                    <span>{link.label}</span>
                    <svg className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FMindset. Built with <span className="text-red-500">❤️</span> for founders who feel alone.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                100% Anonymous
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                No email required
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
