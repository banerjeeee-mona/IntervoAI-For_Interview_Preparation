import { useEffect, useState } from 'react';
import { Clock, Award, TrendingUp, Brain, ChevronRight, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { roleLabels } from '../types';

interface InterviewRecord {
  id: string;
  role: string;
  status: string;
  created_at: string;
  ended_at: string | null;
  feedback?: {
    overall_score: number;
    communication_score: number;
    technical_score: number;
    confidence_score: number;
  };
}

interface HistoryPageProps {
  onStartNew: () => void;
  onViewInterview: (interviewId: string) => void;
}

export function HistoryPage({ onStartNew, onViewInterview }: HistoryPageProps) {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    bestScore: 0,
    improvement: 0,
  });

  useEffect(() => {
    const loadHistory = async () => {
      // Load all interviews with feedback
      const { data: interviewData } = await supabase
        .from('interviews')
        .select(`
          id,
          role,
          status,
          created_at,
          ended_at,
          feedback (overall_score, communication_score, technical_score, confidence_score)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (interviewData) {
        const records: InterviewRecord[] = interviewData.map((item: any) => ({
          id: item.id,
          role: item.role,
          status: item.status,
          created_at: item.created_at,
          ended_at: item.ended_at,
          feedback: item.feedback?.[0] || undefined,
        }));
        setInterviews(records);

        // Calculate stats
        const completed = records.filter(r => r.feedback);
        if (completed.length > 0) {
          const scores = completed.map(r => r.feedback!.overall_score);
          const avg = Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length);
          const best = Math.max(...scores);

          // Calculate improvement (last 3 vs previous 3)
          let improvement = 0;
          if (completed.length >= 6) {
            const recent = completed.slice(0, 3);
            const previous = completed.slice(3, 6);
            const recentAvg = Math.floor(recent.reduce((sum, r) => sum + r.feedback!.overall_score, 0) / 3);
            const previousAvg = Math.floor(previous.reduce((sum, r) => sum + r.feedback!.overall_score, 0) / 3);
            improvement = recentAvg - previousAvg;
          }

          setStats({
            total: records.length,
            avgScore: avg,
            bestScore: best,
            improvement,
          });
        }
      }

      setIsLoading(false);
    };

    loadHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'In progress';
    const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60);
    return `${duration} min`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />
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
                <p className="text-xs text-slate-500">Interview History</p>
              </div>
            </div>

            <button
              onClick={onStartNew}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors text-sm font-medium shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Interview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Interview Progress</h2>
          <p className="text-slate-600">Track your improvement over time and review past performances.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm text-slate-500">Total Sessions</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm text-slate-500">Average Score</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.avgScore}<span className="text-lg text-slate-400">/100</span></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-500">Best Score</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.bestScore}<span className="text-lg text-slate-400">/100</span></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-slate-500">Trend</span>
            </div>
            <div className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
            </div>
          </div>
        </div>

        {/* Interview List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading your interview history...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Interviews Yet</h3>
            <p className="text-slate-600 mb-6">Start your first practice interview to begin tracking your progress.</p>
            <button
              onClick={onStartNew}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors"
            >
              <span>Start Your First Interview</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => onViewInterview(interview.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      interview.feedback ? 'bg-slate-100' : 'bg-amber-50'
                    }`}>
                      {interview.feedback ? (
                        <Award className="w-6 h-6 text-slate-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {roleLabels[interview.role as keyof typeof roleLabels] || interview.role}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span>{formatDate(interview.created_at)}</span>
                        <span>{formatDuration(interview.created_at, interview.ended_at)}</span>
                        <span className={`capitalize ${
                          interview.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {interview.feedback && (
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-lg ${getScoreColor(interview.feedback.overall_score)}`}>
                        <span className="text-2xl font-bold">{interview.feedback.overall_score}</span>
                        <span className="text-sm ml-1">/100</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  )}

                  {!interview.feedback && (
                    <div className="px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
                      In Progress
                    </div>
                  )}
                </div>

                {interview.feedback && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-slate-500">Communication</span>
                      <div className="text-sm font-semibold text-slate-700">{interview.feedback.communication_score}/100</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Technical</span>
                      <div className="text-sm font-semibold text-slate-700">{interview.feedback.technical_score}/100</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Confidence</span>
                      <div className="text-sm font-semibold text-slate-700">{interview.feedback.confidence_score}/100</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
