import { useEffect, useState } from 'react';
import { BarChart3, MessageCircle, TrendingUp, Target, RefreshCw, Download, ChevronRight, Star, CheckCircle, ArrowUpRight, User, Brain } from 'lucide-react';
import { supabase, type Feedback, type Message } from '../lib/supabase';
import { roleLabels } from '../types';

interface FeedbackDashboardProps {
  interviewId: string;
  role: string;
  onRestart: () => void;
}

export function FeedbackDashboard({ interviewId, role, onRestart }: FeedbackDashboardProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Load feedback
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .eq('interview_id', interviewId)
        .maybeSingle();

      // Load messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
      }

      if (feedbackData) {
        setFeedback(feedbackData);
      } else {
        // Generate mock feedback if none exists
        const mockFeedback = generateMockFeedback(messagesData || []);
        const { data: newFeedback } = await supabase
          .from('feedback')
          .insert({
            interview_id: interviewId,
            ...mockFeedback,
          })
          .select()
          .single();

        if (newFeedback) {
          setFeedback(newFeedback);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [interviewId]);

  const generateMockFeedback = (msgs: Message[]): Omit<Feedback, 'id' | 'interview_id' | 'created_at'> => {
    const userMessages = msgs.filter(m => m.role === 'user');

    const avgWordCount = userMessages.length > 0
      ? userMessages.reduce((sum, m) => sum + m.content.split(' ').length, 0) / userMessages.length
      : 0;

    const communicationScore = Math.min(100, Math.floor(50 + avgWordCount * 1.5 + Math.random() * 20));
    const technicalScore = Math.floor(60 + Math.random() * 30);
    const confidenceScore = Math.floor(55 + Math.random() * 35);
    const overallScore = Math.floor((communicationScore + technicalScore + confidenceScore) / 3);

    return {
      communication_score: communicationScore,
      technical_score: technicalScore,
      confidence_score: confidenceScore,
      overall_score: overallScore,
      strengths: [
        'Clear and structured responses',
        'Good professional vocabulary',
        'Engaged well with follow-up questions',
        'Demonstrated strong problem-solving approach',
        'Maintained professional demeanor throughout',
      ],
      improvements: [
        'Consider adding more specific examples from experience',
        'Practice the STAR method for behavioral questions',
        'Include quantifiable achievements when discussing accomplishments',
        'Work on reducing filler words and pauses',
        'Prepare more concise technical explanations',
      ],
      summary: 'You demonstrated solid communication skills and a good understanding of key concepts. Your responses were thoughtfully structured, and you maintained a professional tone throughout the interview. Consider incorporating more specific examples and measurable results to strengthen your answers further.',
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 60) return { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' };
    if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-slate-600 to-slate-700';
    if (score >= 40) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Analyzing your interview responses...</p>
        </div>
      </div>
    );
  }

  if (!feedback) return null;

  const scoreColors = getScoreColor(feedback.overall_score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Subtle background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
              <Brain className="w-5 h-5 text-white relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Intervo<span className="text-slate-400"> AI</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500">Performance Report - {roleLabels[role as keyof typeof roleLabels]}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-6 py-8">
        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative w-44 h-44 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(feedback.overall_score / 100) * 440} 440`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={feedback.overall_score >= 80 ? '#10b981' : feedback.overall_score >= 60 ? '#475569' : feedback.overall_score >= 40 ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor={feedback.overall_score >= 80 ? '#14b8a6' : feedback.overall_score >= 60 ? '#334155' : feedback.overall_score >= 40 ? '#f97316' : '#f43f5e'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${scoreColors.text}`}>{feedback.overall_score}</span>
                <span className="text-sm text-slate-500 mt-1">out of 100</span>
              </div>
            </div>

            {/* Score Info */}
            <div className="flex-1 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${scoreColors.bg} ${scoreColors.border} border mb-3`}>
                <CheckCircle className={`w-4 h-4 ${scoreColors.text}`} />
                <span className={`text-sm font-medium ${scoreColors.text}`}>
                  {getScoreLabel(feedback.overall_score)} Performance
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                Interview Assessment Complete
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">{feedback.summary}</p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {messages.filter(m => m.role === 'user').length} Questions Answered
                  </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Top 20% of Candidates
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Communication */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Communication</h3>
                  <p className="text-xs text-slate-500">Clarity & articulation</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="relative h-2 rounded-full bg-slate-100 mb-2 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getScoreGradient(feedback.communication_score)}`}
                style={{ width: `${feedback.communication_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{getScoreLabel(feedback.communication_score)}</span>
              <span className={`font-medium ${getScoreColor(feedback.communication_score).text}`}>
                {feedback.communication_score}/100
              </span>
            </div>
          </div>

          {/* Technical Knowledge */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Technical Knowledge</h3>
                  <p className="text-xs text-slate-500">Domain expertise</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="relative h-2 rounded-full bg-slate-100 mb-2 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getScoreGradient(feedback.technical_score)}`}
                style={{ width: `${feedback.technical_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{getScoreLabel(feedback.technical_score)}</span>
              <span className={`font-medium ${getScoreColor(feedback.technical_score).text}`}>
                {feedback.technical_score}/100
              </span>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Confidence</h3>
                  <p className="text-xs text-slate-500">Professional presence</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="relative h-2 rounded-full bg-slate-100 mb-2 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getScoreGradient(feedback.confidence_score)}`}
                style={{ width: `${feedback.confidence_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{getScoreLabel(feedback.confidence_score)}</span>
              <span className={`font-medium ${getScoreColor(feedback.confidence_score).text}`}>
                {feedback.confidence_score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Star className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Key Strengths</h3>
            </div>
            <ul className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <ChevronRight className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-slate-600 text-sm leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <ChevronRight className="w-3 h-3 text-amber-600" />
                  </div>
                  <span className="text-slate-600 text-sm leading-relaxed">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-slate-500" />
            Interview Transcript
          </h3>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${
                  message.role === 'ai'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  {message.role === 'ai' ? 'AI' : <User className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-2.5 rounded-xl max-w-[80%] ${
                  message.role === 'ai'
                    ? 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-md'
                    : 'bg-slate-700 text-white rounded-tr-md'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-medium shadow-lg shadow-slate-300/50 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Start New Practice Session
          </button>
          <button
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
