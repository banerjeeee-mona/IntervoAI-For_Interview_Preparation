import { useState, useRef, useCallback } from 'react';
import { FileText, Briefcase, Clock, Target, ChevronRight, Upload, Brain, CheckCircle, X, AlertCircle, Loader2, FileCheck } from 'lucide-react';
import { InterviewRole, roleLabels, roleCategories, ExperienceLevel, experienceLabels, InterviewType, interviewTypeLabels, DetectedSkill } from '../types';

export interface ParsedResumeData {
  extractedText: string;
  skills: DetectedSkill[];
  profession: string;
  experienceLevel: ExperienceLevel;
  education: string[];
  projects: string[];
  summary: {
    wordCount: number;
    topSkills: string[];
    profession: string;
    experienceLevel: string;
    education: string[];
    projectCount: number;
  };
}

interface ResumeUploadPageProps {
  onStartPreparation: (
    resume: string,
    role: InterviewRole,
    experience: ExperienceLevel,
    type: InterviewType,
    parsedData?: ParsedResumeData
  ) => void;
  onNavigate: (page: 'history') => void;
}

type UploadState = 'idle' | 'dragging' | 'parsing' | 'success' | 'error';

export function ResumeUploadPage({ onStartPreparation, onNavigate }: ResumeUploadPageProps) {
  const [resumeText, setResumeText] = useState('');
  const [selectedRole, setSelectedRole] = useState<InterviewRole>('general');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel>('mid');
  const [selectedType, setSelectedType] = useState<InterviewType>('mixed');
  const [isLoading, setIsLoading] = useState(false);

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [parseError, setParseError] = useState<string>('');
  const [showTextFallback, setShowTextFallback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const parseResumeFile = useCallback(async (file: File) => {
    setUploadedFile(file);
    setUploadState('parsing');
    setParseError('');
    setParsedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${supabaseUrl}/functions/v1/parse-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Apikey': supabaseAnonKey,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to parse resume');
      }

      setParsedData(result);
      setResumeText(result.extractedText || '');

      if (result.profession && result.profession !== 'general') {
        setSelectedRole(result.profession as InterviewRole);
      }
      if (result.experienceLevel) {
        setSelectedExperience(result.experienceLevel as ExperienceLevel);
      }

      setUploadState('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse resume';
      setParseError(msg);
      setUploadState('error');
    }
  }, [supabaseUrl, supabaseAnonKey]);

  const handleFileSelect = useCallback((file: File) => {
    const ext = file.name.toLowerCase();
    const validExt = ext.endsWith('.txt') || ext.endsWith('.pdf') || ext.endsWith('.doc') || ext.endsWith('.docx');

    if (!validExt) {
      setParseError('Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      setUploadState('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setParseError('File is too large. Please upload a file smaller than 10MB.');
      setUploadState('error');
      return;
    }

    parseResumeFile(file);
  }, [parseResumeFile]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (uploadState !== 'success') setUploadState('dragging');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0 && uploadState === 'dragging') {
      setUploadState('idle');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParsedData(null);
    setParseError('');
    setUploadState('idle');
    setResumeText('');
    setSelectedRole('general');
    setSelectedExperience('mid');
  };

  const canProceed = parsedData !== null || resumeText.trim().length > 20;

  const handleSubmit = async () => {
    if (!canProceed) return;
    setIsLoading(true);

    if (!parsedData && resumeText.trim()) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/parse-resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Apikey': supabaseAnonKey,
          },
          body: JSON.stringify({ text: resumeText }),
        });
        const result = await response.json();
        if (result.success) {
          onStartPreparation(resumeText, selectedRole, selectedExperience, selectedType, result);
          setIsLoading(false);
          return;
        }
      } catch {
        // proceed without parse result
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    onStartPreparation(
      parsedData?.extractedText || resumeText,
      selectedRole,
      selectedExperience,
      selectedType,
      parsedData || undefined
    );
    setIsLoading(false);
  };

  const getFileTag = () => {
    if (!uploadedFile) return 'FILE';
    const ext = uploadedFile.name.toLowerCase();
    if (ext.endsWith('.pdf')) return 'PDF';
    if (ext.endsWith('.docx') || ext.endsWith('.doc')) return 'DOC';
    return 'TXT';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
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
              <span>Interview History</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-4">
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Step 1 of 3</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Configure Your Interview</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Upload your resume and our AI will automatically extract your skills, experience, and generate personalized interview questions.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Left Column */}
            <div className="flex flex-col gap-7">

              {/* Resume Upload */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Resume / CV</h3>
                  <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Upload file or paste text</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Your resume will be automatically analyzed to personalize your interview.</p>

                {/* Drop Zone — hidden after success */}
                {uploadState !== 'success' && (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={uploadState !== 'parsing' ? () => fileInputRef.current?.click() : undefined}
                    className={`relative flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed transition-all duration-200 ${
                      uploadState === 'parsing'
                        ? 'border-blue-300 bg-blue-50/50 cursor-default'
                        : uploadState === 'dragging'
                        ? 'border-slate-500 bg-slate-50 scale-[1.01] cursor-copy'
                        : uploadState === 'error'
                        ? 'border-red-300 bg-red-50/30 hover:border-red-400 cursor-pointer'
                        : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer'
                    }`}
                    style={{ minHeight: '160px' }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {uploadState === 'parsing' ? (
                      <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Analyzing your resume...</p>
                          <p className="text-xs text-slate-500 mt-1">Extracting skills, experience &amp; education</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {['Scanning content', 'Detecting skills', 'Identifying role'].map((step, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              {step}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : uploadState === 'error' ? (
                      <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-700">Upload failed</p>
                          <p className="text-xs text-red-500 mt-0.5 max-w-xs">{parseError}</p>
                        </div>
                        <p className="text-xs text-slate-500">Click to try again</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                          uploadState === 'dragging' ? 'bg-slate-200 scale-110' : 'bg-slate-100'
                        }`}>
                          <Upload className={`w-7 h-7 transition-colors ${
                            uploadState === 'dragging' ? 'text-slate-700' : 'text-slate-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {uploadState === 'dragging' ? 'Drop your resume here' : 'Drag & drop your resume'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">or click to browse files</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          {['PDF', 'DOCX', 'DOC', 'TXT'].map(fmt => (
                            <span key={fmt} className="px-2 py-0.5 bg-slate-100 rounded">{fmt}</span>
                          ))}
                          <span className="text-slate-300">up to 10MB</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Success card */}
                {uploadState === 'success' && parsedData && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-emerald-200">
                      <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700 shadow-sm">
                        {getFileTag()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{uploadedFile?.name}</p>
                        <p className="text-xs text-slate-500">{parsedData.summary.wordCount.toLocaleString()} words extracted</p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="w-7 h-7 rounded-full bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 flex items-center justify-center transition-colors"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>

                    <div className="px-4 py-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">Resume Successfully Analyzed</span>
                      </div>

                      {parsedData.summary.topSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1.5">Top skills detected:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedData.summary.topSkills.map((skill, i) => (
                              <span key={i} className="text-xs px-2.5 py-0.5 bg-white border border-emerald-200 rounded-full text-slate-700 shadow-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsedData.education.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Education: {parsedData.education.slice(0, 2).join(' • ')}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-emerald-100">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {parsedData.skills.length} skills found
                        </span>
                        {parsedData.projects.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            {parsedData.projects.length} projects
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {parsedData.experienceLevel} level
                        </span>
                      </div>
                    </div>

                    <div className="px-4 pb-3">
                      <button
                        onClick={() => {
                          handleRemoveFile();
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
                      >
                        Upload a different file
                      </button>
                    </div>
                  </div>
                )}

                {/* Text fallback */}
                <div className="mt-3">
                  {uploadState !== 'success' && (
                    <button
                      type="button"
                      onClick={() => setShowTextFallback(v => !v)}
                      className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
                    >
                      {showTextFallback ? 'Hide text input' : 'Or paste resume text instead'}
                    </button>
                  )}

                  {showTextFallback && uploadState !== 'success' && (
                    <div className="mt-2">
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume content here..."
                        className="w-full h-28 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-all resize-none text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Experience Level</h3>
                  {parsedData && (
                    <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Auto-detected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(experienceLabels) as ExperienceLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedExperience(level)}
                      className={`p-3 rounded-lg text-left transition-all duration-200 ${
                        selectedExperience === level
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-sm font-medium">{experienceLabels[level]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Type */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Interview Type</h3>
                </div>
                <div className="space-y-2">
                  {(Object.keys(interviewTypeLabels) as InterviewType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                        selectedType === type
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-sm font-medium">{interviewTypeLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Role Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-800">Target Profession</h3>
                {parsedData && parsedData.profession !== 'general' && (
                  <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Auto-detected
                  </span>
                )}
              </div>

              <div className="max-h-[520px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                {Object.entries(roleCategories).map(([category, roles]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {category}
                    </h4>
                    <div className="space-y-1.5">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                            selectedRole === role
                              ? 'bg-slate-800 text-white shadow-md'
                              : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{roleLabels[role]}</div>
                            <div className={`w-4 h-4 rounded-full border-2 ml-3 flex-shrink-0 flex items-center justify-center transition-all ${
                              selectedRole === role ? 'border-white bg-white' : 'border-slate-300'
                            }`}>
                              {selectedRole === role && (
                                <div className="w-2 h-2 rounded-full bg-slate-800" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Validation hint */}
          {!canProceed && (
            <div className="mt-6 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Please upload your resume file or paste your resume text to continue.</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleSubmit}
              disabled={!canProceed || isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-300 ${
                canProceed
                  ? 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white shadow-lg shadow-slate-400/30 hover:shadow-xl'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{parsedData ? 'Start Interview Preparation' : 'Analyze Resume & Continue'}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
