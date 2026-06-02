import { useState, useEffect } from 'react';
import { Brain, Target, Zap, Award, ChevronRight, CheckCircle, AlertCircle, BarChart3, Clock, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InterviewRole, roleLabels, ExperienceLevel, experienceLabels, InterviewType, interviewTypeLabels, DetectedSkill } from '../types';
import { ParsedResumeData } from './ResumeUploadPage';

interface PreparationPageProps {
  interviewId: string;
  resumeText: string;
  role: InterviewRole;
  experience: ExperienceLevel;
  type: InterviewType;
  parsedData?: ParsedResumeData;
  onStartInterview: () => void;
}

export function PreparationPage({
  interviewId,
  resumeText,
  role,
  experience,
  type,
  parsedData,
  onStartInterview,
}: PreparationPageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [detectedSkills, setDetectedSkills] = useState<DetectedSkill[]>([]);
  const [readinessScore, setReadinessScore] = useState(0);

  useEffect(() => {
    const analyzeResume = async () => {
      // If we already have parsedData, use it directly
      if (parsedData && parsedData.skills.length > 0) {
        setDetectedSkills(parsedData.skills);
        const score = calculateReadinessScore(resumeText, parsedData.skills);
        setReadinessScore(score);
        setIsAnalyzing(false);
        return;
      }

      // Otherwise, simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      const skills = generateMockSkills(role);
      setDetectedSkills(skills);

      const score = calculateReadinessScore(resumeText, skills);
      setReadinessScore(score);

      await supabase
        .from('interviews')
        .update({
          detected_skills: skills,
          resume_uploaded_at: new Date().toISOString()
        })
        .eq('id', interviewId);

      setIsAnalyzing(false);
    };

    analyzeResume();
  }, [resumeText, role, interviewId, parsedData]);

  const generateMockSkills = (targetRole: InterviewRole): DetectedSkill[] => {
    const roleSkills: Record<string, DetectedSkill[]> = {
      software_engineer: [
        { name: 'JavaScript/TypeScript', category: 'Programming', confidence: 95 },
        { name: 'React', category: 'Frontend', confidence: 90 },
        { name: 'Node.js', category: 'Backend', confidence: 85 },
        { name: 'Python', category: 'Programming', confidence: 80 },
        { name: 'SQL', category: 'Database', confidence: 85 },
        { name: 'Git', category: 'Tools', confidence: 95 },
        { name: 'System Design', category: 'Architecture', confidence: 70 },
      ],
      data_analyst: [
        { name: 'SQL', category: 'Database', confidence: 95 },
        { name: 'Python', category: 'Programming', confidence: 90 },
        { name: 'Excel', category: 'Tools', confidence: 95 },
        { name: 'Tableau', category: 'Visualization', confidence: 85 },
        { name: 'Statistics', category: 'Analytics', confidence: 80 },
        { name: 'Data Cleaning', category: 'Process', confidence: 90 },
      ],
      data_scientist: [
        { name: 'Python', category: 'Programming', confidence: 95 },
        { name: 'Machine Learning', category: 'AI/ML', confidence: 90 },
        { name: 'Statistics', category: 'Math', confidence: 85 },
        { name: 'TensorFlow/PyTorch', category: 'Frameworks', confidence: 80 },
        { name: 'SQL', category: 'Database', confidence: 85 },
        { name: 'Data Visualization', category: 'Tools', confidence: 75 },
      ],
      hr: [
        { name: 'Recruitment', category: 'Core HR', confidence: 95 },
        { name: 'Employee Relations', category: 'Core HR', confidence: 85 },
        { name: 'HRIS Systems', category: 'Tools', confidence: 80 },
        { name: 'Performance Management', category: 'Process', confidence: 90 },
        { name: 'Labor Laws', category: 'Compliance', confidence: 75 },
      ],
      finance: [
        { name: 'Financial Analysis', category: 'Core Finance', confidence: 95 },
        { name: 'Excel', category: 'Tools', confidence: 95 },
        { name: 'Financial Modeling', category: 'Analysis', confidence: 90 },
        { name: 'Accounting', category: 'Knowledge', confidence: 85 },
        { name: 'Budgeting', category: 'Planning', confidence: 88 },
      ],
      general: [
        { name: 'Communication', category: 'Soft Skills', confidence: 90 },
        { name: 'Problem Solving', category: 'Cognitive', confidence: 85 },
        { name: 'Teamwork', category: 'Soft Skills', confidence: 88 },
        { name: 'Leadership', category: 'Management', confidence: 75 },
        { name: 'Time Management', category: 'Productivity', confidence: 82 },
      ],
    };

    for (const key in roleSkills) {
      if (roleLabels[key as InterviewRole]?.toLowerCase().includes(targetRole.toLowerCase())) {
        return roleSkills[key];
      }
    }
    return roleSkills.general;
  };

  const calculateReadinessScore = (resume: string, skills: DetectedSkill[]): number => {
    let score = 50; // Base score

    // Resume length bonus
    const wordCount = resume.split(/\s+/).length;
    if (wordCount > 300) score += 15;
    else if (wordCount > 200) score += 10;
    else if (wordCount > 100) score += 5;

    // Skills bonus
    const avgConfidence = skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length;
    score += Math.floor(avgConfidence / 10);

    // Cap at 100
    return Math.min(100, score);
  };

  const getReadinessMessage = (score: number): { text: string; color: string } => {
    if (score >= 85) return { text: 'Excellent! You are well-prepared.', color: 'text-emerald-600' };
    if (score >= 70) return { text: 'Good preparation. Ready for interview.', color: 'text-blue-600' };
    if (score >= 55) return { text: 'Decent preparation. Practice recommended.', color: 'text-amber-600' };
    return { text: 'More preparation needed before interview.', color: 'text-red-600' };
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto mb-6 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-transparent" />
            <Brain className="w-10 h-10 text-white relative z-10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Analyzing Your Resume</h2>
          <p className="text-slate-600 mb-6">Our AI is extracting skills and preparing your personalized interview...</p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  const readiness = getReadinessMessage(readinessScore);

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
              <Brain className="w-5 h-5 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                Intervo<span className="text-slate-400"> AI</span>
              </h1>
              <p className="text-xs text-slate-500">Interview Preparation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-4">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Step 2 of 3</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Interview Preparation Complete</h2>
          <p className="text-slate-600 max-w-xl mx-auto">We have analyzed your resume and prepared a personalized interview experience.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Readiness Score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-slate-600" />
              </div>
              <span className={`text-3xl font-bold ${readiness.color}`}>{readinessScore}%</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Interview Readiness</h3>
            <p className="text-sm text-slate-600">{readiness.text}</p>
          </div>

          {/* Interview Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-3">Interview Configuration</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-slate-700">{roleLabels[role]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Level</span>
                <span className="font-medium text-slate-700">{experienceLabels[experience]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-700">{interviewTypeLabels[type]}</span>
              </div>
            </div>
          </div>

          {/* Skills Detected */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-3">Skills Detected</h3>
            <div className="text-3xl font-bold text-slate-800 mb-1">{detectedSkills.length}</div>
            <p className="text-sm text-slate-600">Key competencies identified</p>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-slate-600" />
            Detected Skills & Technologies
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {detectedSkills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div>
                  <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                  <span className="block text-xs text-slate-500">{skill.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-600 to-slate-700"
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{skill.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation Tips */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">AI Interview Tips</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Be specific with your examples - use the STAR method (Situation, Task, Action, Result)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Speak clearly and at a moderate pace - don't rush your answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Connect your skills to actual projects and measurable outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>It's okay to pause and think - quality over speed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="text-center">
          <button
            onClick={onStartInterview}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white font-semibold shadow-lg shadow-slate-400/30 hover:shadow-xl transition-all"
          >
            <span className="text-lg">Start Voice Interview</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-500 mt-3">
            <Clock className="w-4 h-4 inline mr-1" />
            Estimated duration: 15-20 minutes
          </p>
        </div>
      </main>
    </div>
  );
}
