import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Mic, MicOff, Send, Clock, MessageCircle, AlertCircle, PhoneOff, Volume2, User, Brain } from 'lucide-react';
import { VoiceWaveAnimation } from './VoiceWaveAnimation';
import { supabase, type Message } from '../lib/supabase';
import { InterviewRole, roleLabels } from '../types';
import { ROLE_QUESTIONS, FOLLOW_UPS } from '../lib/questions';
import { ParsedResumeData } from './ResumeUploadPage';

interface InterviewScreenProps {
  interviewId: string;
  role: InterviewRole;
  sessionId: string;
  parsedData?: ParsedResumeData;
  onEndInterview: () => void;
}

export function InterviewScreen({ interviewId, role, sessionId, parsedData, onEndInterview }: InterviewScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate dynamic questions based on parsed resume data
  useEffect(() => {
    const baseQuestions = ROLE_QUESTIONS[role] || ROLE_QUESTIONS.general;

    if (parsedData && parsedData.skills.length > 0) {
      const personalized: string[] = [];

      // Add skill-based questions
      const topSkills = parsedData.skills.slice(0, 3).map(s => s.name);
      if (topSkills.length > 0) {
        personalized.push(`Welcome! I noticed from your resume that you have experience with ${topSkills.join(', ')}. Can you tell me more about how you've applied these skills in your projects?`);
      }

      // Add standard questions
      personalized.push(...baseQuestions.slice(1, 4));

      // Add project-based question if projects detected
      if (parsedData.projects && parsedData.projects.length > 0) {
        personalized.splice(3, 0, `I see you've worked on several projects. Can you walk me through one of your notable projects and describe the technical challenges you faced?`);
      }

      // Add education-based question
      if (parsedData.education && parsedData.education.length > 0) {
        personalized.splice(5, 0, `How has your educational background in ${parsedData.education[0]} prepared you for this role?`);
      }

      // Add remaining questions
      personalized.push(...baseQuestions.slice(4));

      setDynamicQuestions(personalized.slice(0, 8));
    } else {
      setDynamicQuestions(baseQuestions);
    }
  }, [role, parsedData]);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        if (data.length === 0) {
          askQuestion(0);
        } else {
          setCurrentQuestionIndex(Math.floor(data.filter(m => m.role === 'ai').length));
        }
      }
    };

    loadMessages();
  }, [interviewId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const askQuestion = useCallback(async (questionIndex: number) => {
    const questions = dynamicQuestions.length > 0 ? dynamicQuestions : ROLE_QUESTIONS[role];
    if (questionIndex >= questions.length) {
      onEndInterview();
      return;
    }

    setIsAiThinking(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsAiThinking(false);

    const question = questions[questionIndex];

    // Save AI message
    const { data } = await supabase
      .from('messages')
      .insert({
        interview_id: interviewId,
        role: 'ai',
        content: question,
        session_id: sessionId,
      })
      .select()
      .single();

    if (data) {
      setMessages(prev => [...prev, data]);
    }

    // Speak the question
    setIsAiSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => {
      setIsAiSpeaking(false);
      startListening();
    };
    synthRef.current?.speak(utterance);
  }, [role, interviewId, onEndInterview]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentTranscript(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!currentTranscript.trim()) return;

    stopListening();

    // Save user message
    const { data: userMessage } = await supabase
      .from('messages')
      .insert({
        interview_id: interviewId,
        role: 'user',
        content: currentTranscript,
        session_id: sessionId,
      })
      .select()
      .single();

    if (userMessage) {
      setMessages(prev => [...prev, userMessage]);
    }

    setCurrentTranscript('');

    // Determine next question or follow-up
    const nextIndex = currentQuestionIndex + 1;
    const questions = dynamicQuestions.length > 0 ? dynamicQuestions : ROLE_QUESTIONS[role];

    // 50% chance of follow-up for deeper conversation
    const shouldFollowUp = Math.random() < 0.5 && currentQuestionIndex < questions.length - 1;

    if (shouldFollowUp) {
      setIsAiThinking(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsAiThinking(false);

      const followUp = FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)];

      const { data: followUpMessage } = await supabase
        .from('messages')
        .insert({
          interview_id: interviewId,
          role: 'ai',
          content: followUp,
        })
        .select()
        .single();

      if (followUpMessage) {
        setMessages(prev => [...prev, followUpMessage]);
      }

      setIsAiSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(followUp);
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsAiSpeaking(false);
        startListening();
      };
      synthRef.current?.speak(utterance);
    } else {
      setCurrentQuestionIndex(nextIndex);
      askQuestion(nextIndex);
    }
  }, [currentTranscript, interviewId, currentQuestionIndex, role, stopListening, askQuestion, startListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndEarly = async () => {
    stopListening();
    synthRef.current?.cancel();
    await supabase
      .from('interviews')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', interviewId);
    onEndInterview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col">
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
                <Brain className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                    Intervo<span className="text-slate-400"> AI</span>
                  </h1>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm font-medium text-slate-600">{roleLabels[role]}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatTime(elapsedTime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    Q{Math.min(currentQuestionIndex + 1, dynamicQuestions.length || ROLE_QUESTIONS[role].length)} of {dynamicQuestions.length || ROLE_QUESTIONS[role].length}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleEndEarly}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="text-sm font-medium">End Interview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="relative bg-white/50 border-b border-slate-100">
        <div className="h-1 bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-slate-600 to-slate-700 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / (dynamicQuestions.length || ROLE_QUESTIONS[role].length)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col max-w-4xl w-full mx-auto">
        {/* Status Banner */}
        <div className="py-4 px-6 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isAiSpeaking
              ? 'bg-slate-100 text-slate-700'
              : isListening
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isAiThinking
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-50 text-slate-600'
          }`}>
            {isAiSpeaking ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-medium">AI Interviewer Speaking</span>
              </>
            ) : isListening ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">Listening to Your Response</span>
              </>
            ) : isAiThinking ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">AI Processing</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium">Interview In Progress</span>
              </>
            )}
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.role === 'ai'
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  {message.role === 'ai' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`px-5 py-3.5 rounded-2xl ${
                  message.role === 'ai'
                    ? 'bg-white border border-slate-200 shadow-sm text-slate-700 rounded-tl-md'
                    : 'bg-slate-700 text-white rounded-tr-md'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* AI Thinking Indicator */}
          {isAiThinking && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm rounded-tl-md">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Interaction Panel */}
        <div className="relative bg-white/90 backdrop-blur border-t border-slate-200 px-6 py-6">
          <div className="flex flex-col items-center">
            {/* Voice Visualization */}
            <div className="mb-5">
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? 'bg-emerald-50 border-2 border-emerald-200'
                  : isAiSpeaking
                  ? 'bg-slate-100 border-2 border-slate-300'
                  : 'bg-slate-50 border-2 border-slate-200'
              }`}>
                {(isListening || isAiSpeaking) && (
                  <div className={`absolute inset-0 rounded-full animate-ping ${
                    isListening ? 'bg-emerald-100' : 'bg-slate-100'
                  } opacity-50`} />
                )}
                <div className="relative w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
                  {isAiSpeaking ? (
                    <VoiceWaveAnimation isActive={true} color="slate" size="sm" />
                  ) : isListening ? (
                    <Mic className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <Mic className="w-7 h-7 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Current Transcript */}
            {currentTranscript && (
              <div className="w-full max-w-xl mb-4">
                <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-600 text-center">
                    {currentTranscript}
                    <span className="animate-pulse ml-1 text-slate-400">|</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isAiSpeaking && currentTranscript && (
                <button
                  onClick={submitAnswer}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Submit Response
                </button>
              )}

              {isListening && !currentTranscript && (
                <div className="flex items-center gap-2 px-4 py-2 text-slate-500 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Listening... Speak your answer</span>
                </div>
              )}

              {isListening && (
                <button
                  onClick={stopListening}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium border border-slate-200 transition-colors"
                >
                  <MicOff className="w-4 h-4" />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
