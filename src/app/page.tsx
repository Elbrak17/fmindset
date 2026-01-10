import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-[10%] w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-[30%] w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-indigo-300/20 rounded-full blur-3xl animate-blob animation-delay-1000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-lg shadow-indigo-500/5 mb-8 animate-fade-in-down">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">Scientifically-Backed Assessment</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">New</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight animate-fade-in-up">
              Understand Your
              <span className="block mt-2 gradient-text pb-2">
                Founder Psychology
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              67% of founders experience imposter syndrome. Burnout rates are 
              <span className="font-semibold text-rose-500"> 3x higher</span> than employees.
              <span className="block mt-2 font-medium text-gray-800">You don&apos;t have to face it alone.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animation-delay-300">
              <Link
                href="/assessment/quiz"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite]" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                </span>
                <span className="absolute inset-[2px] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[14px] group-hover:bg-transparent transition-all duration-500" />
                <span className="relative flex items-center gap-2">
                  Start Free Assessment
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <span className="absolute inset-0 rounded-2xl shadow-xl shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-500" />
              </Link>
              
              <span className="text-gray-500 text-sm flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No email
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5 minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  100% anonymous
                </span>
              </span>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up animation-delay-400">
              {[
                { icon: '🔒', text: 'Zero data collection' },
                { icon: '🧪', text: 'Research-based' },
                { icon: '🤖', text: 'AI-powered insights' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm">
                  <span>{badge.icon}</span>
                  <span className="text-sm text-gray-600">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </section>

      {/* Stats Section - Light Theme */}
      <section className="py-20 bg-gradient-to-b from-indigo-50/50 to-purple-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Silent Crisis of Founder Mental Health
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Traditional therapy is expensive and doesn&apos;t understand startup psychology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { value: '67%', label: 'of founders experience imposter syndrome', color: 'from-rose-500 to-orange-500', bg: 'from-rose-50 to-orange-50', border: 'border-rose-200' },
              { value: '3x', label: 'higher burnout rate than employees', color: 'from-amber-500 to-yellow-500', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
              { value: '50%', label: 'of startups fail due to founder burnout', color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50', border: 'border-purple-200' },
            ].map((stat, i) => (
              <div key={i} className={`group relative p-8 rounded-3xl bg-gradient-to-br ${stat.bg} border ${stat.border} backdrop-blur-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-500`}>
                <div className={`text-5xl md:text-6xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}>
                  {stat.value}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How FMindset Works
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              A comprehensive assessment designed specifically for the founder journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', icon: '📝', title: 'Take the Assessment', desc: 'Answer 25 questions across 7 psychological dimensions. No email, completely anonymous.', color: 'indigo' },
              { step: '02', icon: '🎯', title: 'Discover Your Archetype', desc: 'Get classified into one of 8 founder archetypes based on your unique psychological profile.', color: 'purple' },
              { step: '03', icon: '🤖', title: 'Get AI Insights', desc: 'Receive personalized recommendations and actionable advice from our AI psychologist.', color: 'pink' },
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
                  <span className={`absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-${item.color}-100 flex items-center justify-center text-${item.color}-600 font-bold text-sm shadow-lg`}>
                    {item.step}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Dimensions */}
      <section className="py-24 bg-gradient-to-b from-indigo-50/50 to-purple-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-indigo-600 text-sm font-semibold mb-4 shadow-sm">
              Comprehensive Analysis
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              7 Psychological Dimensions
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We measure the key factors that impact founder mental health and performance
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: '🎭', title: 'Imposter Syndrome', desc: 'Feeling like a fraud' },
              { icon: '🤔', title: 'Founder Doubt', desc: 'Questioning your ability' },
              { icon: '🔗', title: 'Identity Fusion', desc: 'Self-worth tied to startup' },
              { icon: '😰', title: 'Fear of Rejection', desc: 'Market validation anxiety' },
              { icon: '🎲', title: 'Risk Tolerance', desc: 'Comfort with uncertainty' },
              { icon: '💪', title: 'Motivation Type', desc: 'Intrinsic vs extrinsic' },
              { icon: '🏝️', title: 'Isolation Level', desc: 'Feeling alone' },
            ].map((dim, i) => (
              <div key={i} className="group p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-sm hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform duration-300">{dim.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{dim.title}</h3>
                <p className="text-xs text-gray-500">{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Archetypes */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold mb-4">
              Personality Types
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              8 Founder Archetypes
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover which founder personality type matches your profile
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: '🏗️', name: 'Perfectionist Builder', special: false },
              { icon: '🚀', name: 'Opportunistic Visionary', special: false },
              { icon: '💭', name: 'Isolated Dreamer', special: false },
              { icon: '🔥', name: 'Burning Out', special: true },
              { icon: '💼', name: 'Self-Assured Hustler', special: false },
              { icon: '🤝', name: 'Community-Driven', special: false },
              { icon: '⚖️', name: 'Balanced Founder', special: false },
              { icon: '📈', name: 'Growth Seeker', special: false },
            ].map((arch, i) => (
              <div 
                key={i} 
                className={`group relative p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  arch.special 
                    ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200' 
                    : 'bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">{arch.icon}</span>
                <h3 className="font-semibold text-gray-900 text-sm">{arch.name}</h3>
                {arch.special && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                    ⚠️ Needs attention
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-amber-50 border-y border-amber-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center flex items-center justify-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-amber-800 text-sm">
              <span className="font-semibold">Important:</span> FMindset is a self-reflection tool, not a medical diagnosis. 
              If you&apos;re experiencing severe distress, please contact a mental health professional.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping animation-delay-500" />
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Understand
              <span className="block">Yourself Better?</span>
            </h2>
            <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Join founders who have gained valuable insights about their psychological patterns.
            </p>
            <Link
              href="/assessment/quiz"
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-indigo-600 bg-white rounded-2xl shadow-2xl shadow-black/20 hover:shadow-black/30 transform hover:scale-105 transition-all duration-300"
            >
              Start Your Free Assessment
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-6 text-indigo-200 text-sm">
              Takes only 5 minutes • 100% anonymous • Instant results
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
