import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in-left">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">Dashboard</h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your assessments and view your progress</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-white/50 focus-ring animate-slide-in-right"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 animate-scale-in">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-600 mb-1">Assessments Completed</p>
                <p className="text-3xl font-bold gradient-text">0</p>
              </div>
            </div>
          </div>

          <div className="card p-8 animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-600 mb-1">Growth Score</p>
                <p className="text-3xl font-bold gradient-text">--</p>
              </div>
            </div>
          </div>

          <div className="card p-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-600 mb-1">Last Assessment</p>
                <p className="text-3xl font-bold gradient-text">--</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Take Assessment Card */}
          <div className="group card-interactive p-10 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Take Assessment</h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Complete your psychological assessment to discover your founder profile and get personalized insights.
            </p>
            <Link
              href="/assessment/quiz"
              className="btn-primary w-full text-lg py-4"
            >
              Start Assessment
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* View Results Card */}
          <div className="group card-interactive p-10 text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">View Results</h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Review your latest assessment results, archetype classification, and AI-powered insights.
            </p>
            <Link
              href="/assessment/results"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-lg focus-ring"
            >
              View Results
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* Assessment History Card */}
          <div className="group card-interactive p-10 text-center md:col-span-2 lg:col-span-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl mb-8 group-hover:scale-110 transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Assessment History</h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Track your progress over time with previous assessments and see your growth journey.
            </p>
            <button 
              disabled
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed text-lg"
            >
              Coming Soon
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-4xl p-12 text-white relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
          <div className="text-center max-w-4xl mx-auto relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Your Assessment</h2>
            <p className="text-blue-100 mb-10 leading-relaxed text-lg">
              Our comprehensive psychological assessment measures 7 key dimensions of founder psychology 
              and classifies you into one of 8 distinct founder archetypes. Get personalized insights 
              powered by AI to help you understand your strengths and growth opportunities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="animate-scale-in">
                <div className="text-4xl md:text-5xl font-bold mb-2">25</div>
                <div className="text-blue-200 text-lg">Questions</div>
              </div>
              <div className="animate-scale-in" style={{animationDelay: '0.1s'}}>
                <div className="text-4xl md:text-5xl font-bold mb-2">7</div>
                <div className="text-blue-200 text-lg">Dimensions</div>
              </div>
              <div className="animate-scale-in" style={{animationDelay: '0.2s'}}>
                <div className="text-4xl md:text-5xl font-bold mb-2">8</div>
                <div className="text-blue-200 text-lg">Archetypes</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}