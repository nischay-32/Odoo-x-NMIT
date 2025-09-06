import { Link } from 'react-router-dom'
import { Users, CheckCircle, MessageSquare, Calendar, BarChart3, Shield } from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SynergySphere</span>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Where Teams
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Collaborate</span>
            <br />
            Seamlessly
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            SynergySphere is the intelligent backbone for team collaboration. 
            Stay organized, communicate better, and work smarter with tools that 
            adapt to how your team thinks and moves forward together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Collaborating
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-lg font-semibold rounded-xl border border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Everything Your Team Needs
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built to solve the real pain points that slow teams down every day
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Smart Task Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Track progress with intuitive boards. Never lose sight of what's important 
                or what's holding your team back.
              </p>
            </div>

            <div className="group bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-16 h-16 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Threaded Discussions</h3>
              <p className="text-slate-600 leading-relaxed">
                Keep conversations organized and contextual. No more scattered 
                chats or missed updates.
              </p>
            </div>

            <div className="group bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-50 group-hover:bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Deadline Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Surface potential issues before they become problems. 
                Stay ahead instead of constantly reacting.
              </p>
            </div>

            <div className="group bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-16 h-16 bg-orange-50 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Progress Visualization</h3>
              <p className="text-slate-600 leading-relaxed">
                Clear, intuitive views of project progress. Know exactly 
                where you stand at any moment.
              </p>
            </div>

            <div className="group bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-16 h-16 bg-red-50 group-hover:bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Team Coordination</h3>
              <p className="text-slate-600 leading-relaxed">
                Prevent resource overload and confusion. Everyone knows 
                what they're supposed to do.
              </p>
            </div>

            <div className="group bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-16 h-16 bg-indigo-50 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Secure & Reliable</h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade security with reliable performance. 
                Your data is safe and always accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Team's Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join teams who've already discovered the power of intelligent collaboration
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 text-lg font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">SynergySphere</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              © 2024 SynergySphere. Built for teams that move fast.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
