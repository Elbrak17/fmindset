import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8 animate-bounce-gentle">
              <span className="inline-block text-7xl md:text-8xl mb-6 filter drop-shadow-lg">🧠</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold gradient-text mb-8 leading-tight animate-fade-in">
              Welcome to FMindset
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-in-left">
              Discover your founder psychology profile with our comprehensive assessment 
              designed specifically for young entrepreneurs aged 16-24.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-in-right">
              <Link
                href="/assessment/quiz"
                className="group relative btn-primary text-xl px-10 py-5 min-w-[280px] animate-pulse-glow"
              >
                <span className="relative z-10 flex items-center">
                  Take the Assessment
                  <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary text-xl px-10 py-5 min-w-[280px]"
              >
                <span className="flex items-center">
                  View Dashboard
                  <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <section className="py-24 lg:py-32 glass-effect">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Comprehensive Psychological Assessment
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-slide-in-left">
              Our scientifically-backed assessment provides deep insights into your founder mindset
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
            <div className="group card-interactive p-10 text-center animate-scale-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">7 Psychological Dimensions</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Measure imposter syndrome, founder doubt, identity fusion, fear of rejection, risk tolerance, motivation type, and isolation level
              </p>
            </div>
            
            <div className="group card-interactive p-10 text-center animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">8 Founder Archetypes</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Discover which founder personality type matches your profile: from Perfectionist Builder to Growth Seeker
              </p>
            </div>
            
            <div className="group card-interactive p-10 text-center animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mb-8 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Get personalized recommendations and actionable insights from our AI psychologist powered by advanced language models
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <div className="text-5xl font-bold gradient-text mb-2">25</div>
              <div className="text-gray-600 text-lg font-medium">Comprehensive Questions</div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="text-5xl font-bold gradient-text mb-2">7</div>
              <div className="text-gray-600 text-lg font-medium">Psychological Dimensions</div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="text-5xl font-bold gradient-text mb-2">8</div>
              <div className="text-gray-600 text-lg font-medium">Unique Archetypes</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 animate-fade-in">
              Ready to Discover Your Founder Profile?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed animate-slide-in-left">
              Join thousands of young entrepreneurs who have gained valuable insights about their psychological patterns and growth opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-in-right">
              <Link
                href="/assessment/quiz"
                className="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-blue-600 bg-white rounded-2xl shadow-strong hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300 focus-ring"
              >
                Start Your Assessment Now
                <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-blue-200 mt-8 text-lg">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                100% Anonymous
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Takes 5-7 minutes
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Instant results
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-12">
            <h3 className="text-3xl font-bold mb-4 gradient-text">FMindset</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Empowering young founders through psychological insights and personalized growth recommendations
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              © 2024 FMindset. This tool is designed for support and does not replace professional psychological advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}