import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ResumeUploadPage, ParsedResumeData } from './components/ResumeUploadPage';
import { PreparationPage } from './components/PreparationPage';
import { InterviewScreen } from './components/InterviewScreen';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { HistoryPage } from './components/HistoryPage';
import { supabase } from './lib/supabase';
import { AppPage, InterviewRole, ExperienceLevel, InterviewType } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [interviewId, setInterviewId] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<InterviewRole>('general');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel>('mid');
  const [selectedType, setSelectedType] = useState<InterviewType>('mixed');
  const [parsedData, setParsedData] = useState<ParsedResumeData | undefined>(undefined);

  // Navigation handlers
  const handleNavigateToUpload = () => {
    setCurrentPage('upload');
  };

  const handleNavigateToHistory = () => {
    setCurrentPage('history');
  };

  const handleNavigateToLanding = () => {
    setCurrentPage('landing');
    setInterviewId('');
    setResumeText('');
    setParsedData(undefined);
  };

  // Start preparation from upload page
  const handleStartPreparation = async (
    resume: string,
    role: InterviewRole,
    experience: ExperienceLevel,
    type: InterviewType,
    parsed?: ParsedResumeData
  ) => {
    setResumeText(resume);
    setSelectedRole(role);
    setSelectedExperience(experience);
    setSelectedType(type);
    setParsedData(parsed);

    // Create interview record
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        resume_text: resume,
        role,
        experience_level: experience,
        interview_type: type,
        status: 'preparing',
        detected_skills: parsed?.skills || [],
        parsed_education: parsed?.education || [],
        parsed_projects: parsed?.projects || [],
        parsed_profession: parsed?.profession || '',
      })
      .select()
      .single();

    if (data && !error) {
      setInterviewId(data.id);
      setCurrentPage('preparation');
    }
  };

  // Start interview from preparation page
  const handleStartInterview = async () => {
    // Update interview status to active
    await supabase
      .from('interviews')
      .update({
        status: 'active',
        preparation_completed_at: new Date().toISOString()
      })
      .eq('id', interviewId);

    setCurrentPage('interview');
  };

  // End interview and show feedback
  const handleEndInterview = () => {
    setCurrentPage('feedback');
  };

  // View specific interview from history
  const handleViewInterview = (id: string) => {
    setInterviewId(id);
    setCurrentPage('feedback');
  };

  // Restart to landing page
  const handleRestart = () => {
    setCurrentPage('landing');
    setInterviewId('');
    setResumeText('');
    setParsedData(undefined);
  };

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage onStartInterview={handleNavigateToUpload} onNavigate={handleNavigateToHistory} />
      )}

      {currentPage === 'upload' && (
        <ResumeUploadPage
          onStartPreparation={handleStartPreparation}
          onNavigate={handleNavigateToHistory}
        />
      )}

      {currentPage === 'preparation' && interviewId && (
        <PreparationPage
          interviewId={interviewId}
          resumeText={resumeText}
          role={selectedRole}
          experience={selectedExperience}
          type={selectedType}
          parsedData={parsedData}
          onStartInterview={handleStartInterview}
        />
      )}

      {currentPage === 'interview' && interviewId && (
        <InterviewScreen
          interviewId={interviewId}
          role={selectedRole}
          parsedData={parsedData}
          onEndInterview={handleEndInterview}
        />
      )}

      {currentPage === 'feedback' && interviewId && (
        <FeedbackDashboard
          interviewId={interviewId}
          role={selectedRole}
          onRestart={handleRestart}
        />
      )}

      {currentPage === 'history' && (
        <HistoryPage
          onStartNew={handleNavigateToLanding}
          onViewInterview={handleViewInterview}
        />
      )}
    </>
  );
}

export default App;
