import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">🧠</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FMindset
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-md">
              A scientifically-backed psychological assessment platform helping young founders 
              prevent burnout and understand their mental patterns.
            </p>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
              ⚠️ This is not a medical diagnosis. If you're experiencing severe distress, 
              please contact a mental health professional.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/assessment/quiz" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors">
                  Take Assessment
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Crisis Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://988lifeline.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  988 Suicide & Crisis Lifeline
                </a>
              </li>
              <li>
                <a 
                  href="https://www.crisistextline.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  Crisis Text Line
                </a>
              </li>
              <li>
                <a 
                  href="https://findahelpline.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  Find a Helpline (Global)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © 2026 FMindset. Built with ❤️ for founders who feel alone.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-400">
                🔒 100% Anonymous • No email required
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
