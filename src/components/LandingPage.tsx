import { Sparkles, ChevronRight, Users, Briefcase, Clock, Brain, Zap } from 'lucide-react';

interface LandingPageProps {
  onStartInterview: () => void;
  onNavigate: (page: 'history') => void;
}

export function LandingPage({ onStartInterview, onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-cyan-100/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
                <Brain className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Intervo<span className="text-slate-400"> AI</span>
                </h1>
                <p className="text-xs text-slate-500">AI Interview Preparation</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('history')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              <span>My Progress</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-slate-600">Next-Generation AI Interview Coaching</span>
          </div>

          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tight mb-3">
              Intervo<span className="text-slate-400"> AI</span>
            </h1>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-4" />
            <p className="text-xl md:text-2xl text-slate-500 font-light tracking-wide">
              Don't just apply.<span className="text-slate-700 font-medium"> Ace it.</span>
            </p>
          </div>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice interviews with AI that adapts to your industry. Get real-time voice interaction,
            personalized questions, and actionable feedback to land your dream job.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-slate-600">
              <Briefcase className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium">24+ Industries</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium">Real-time Voice AI</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium">Instant Feedback</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={onStartInterview}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white font-semibold shadow-lg shadow-slate-400/30 hover:shadow-xl transition-all text-lg"
          >
            <Zap className="w-5 h-5" />
            <span>Start Practice Interview</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Why Choose Intervo AI?</h2>
            <p className="text-slate-600">Professional interview preparation powered by advanced AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="group p-6 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors border border-slate-200">
                <Brain className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Our AI analyzes your resume to create personalized interview questions tailored to your experience level</p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors border border-slate-200">
                <Users className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">24+ Industries</h3>
              <p className="text-sm text-slate-600 leading-relaxed">From tech to healthcare, finance to creative fields - we cover interview preparation for every profession</p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors border border-slate-200">
                <Sparkles className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">Real-Time Feedback</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Get instant analysis on communication, technical knowledge, and confidence with actionable improvement tips</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">How It Works</h2>
            <p className="text-slate-600">Three simple steps to interview success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Upload Resume</h3>
              <p className="text-sm text-slate-600">Upload your resume and select your target profession and experience level</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Practice Interview</h3>
              <p className="text-sm text-slate-600">Engage in realistic voice-based interview with our AI interviewer</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Get Feedback</h3>
              <p className="text-sm text-slate-600">Receive detailed analytics and personalized improvement recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 bg-white/50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Intervo<span className="text-slate-400"> AI</span></span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500">Empowering careers through AI-driven interview preparation</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span>Secure & Private</span>
              <span>AI-Powered</span>
              <span>24/7 Available</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
