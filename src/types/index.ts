export type InterviewRole =
  | 'software_engineer'
  | 'data_analyst'
  | 'data_scientist'
  | 'web_developer'
  | 'ui_ux_designer'
  | 'product_manager'
  | 'digital_marketing'
  | 'hr'
  | 'finance'
  | 'sales'
  | 'customer_support'
  | 'teacher'
  | 'doctor'
  | 'nurse'
  | 'lawyer'
  | 'business_analyst'
  | 'content_creator'
  | 'journalist'
  | 'civil_services'
  | 'mechanical_engineer'
  | 'electrical_engineer'
  | 'hotel_management'
  | 'banking'
  | 'general';

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';

export type InterviewType = 'behavioral' | 'technical' | 'mixed';

export const roleLabels: Record<InterviewRole, string> = {
  software_engineer: 'Software Engineer',
  data_analyst: 'Data Analyst',
  data_scientist: 'Data Scientist',
  web_developer: 'Web Developer',
  ui_ux_designer: 'UI/UX Designer',
  product_manager: 'Product Manager',
  digital_marketing: 'Digital Marketing',
  hr: 'Human Resources',
  finance: 'Finance',
  sales: 'Sales',
  customer_support: 'Customer Support',
  teacher: 'Teacher',
  doctor: 'Doctor',
  nurse: 'Nurse',
  lawyer: 'Lawyer',
  business_analyst: 'Business Analyst',
  content_creator: 'Content Creator',
  journalist: 'Journalist',
  civil_services: 'Civil Services',
  mechanical_engineer: 'Mechanical Engineer',
  electrical_engineer: 'Electrical Engineer',
  hotel_management: 'Hotel Management',
  banking: 'Banking',
  general: 'General Mock Interview',
};

export const roleCategories: Record<string, InterviewRole[]> = {
  'Technology': ['software_engineer', 'data_analyst', 'data_scientist', 'web_developer', 'ui_ux_designer'],
  'Business & Management': ['product_manager', 'business_analyst', 'digital_marketing', 'sales'],
  'Finance & Banking': ['finance', 'banking'],
  'Human Resources': ['hr'],
  'Healthcare': ['doctor', 'nurse'],
  'Legal': ['lawyer'],
  'Education': ['teacher'],
  'Media & Creative': ['content_creator', 'journalist'],
  'Engineering': ['mechanical_engineer', 'electrical_engineer', 'civil_services'],
  'Service Industry': ['hotel_management', 'customer_support'],
  'General': ['general'],
};

export const roleDescriptions: Record<InterviewRole, string> = {
  software_engineer: 'Focus on algorithms, system design, and coding skills',
  data_analyst: 'Focus on data analysis, SQL, and visualization tools',
  data_scientist: 'Focus on ML, statistics, and data modeling',
  web_developer: 'Focus on frontend, backend, and full-stack development',
  ui_ux_designer: 'Focus on user research, design thinking, and prototyping',
  product_manager: 'Focus on product strategy, roadmap, and stakeholder management',
  digital_marketing: 'Focus on SEO, SEM, social media, and campaign optimization',
  hr: 'Focus on recruitment, employee relations, and HR policies',
  finance: 'Focus on financial analysis, reporting, and budgeting',
  sales: 'Focus on sales strategy, negotiation, and client relationships',
  customer_support: 'Focus on customer service, problem resolution, and communication',
  teacher: 'Focus on pedagogy, curriculum development, and classroom management',
  doctor: 'Focus on clinical knowledge, patient care, and medical ethics',
  nurse: 'Focus on patient care, clinical skills, and healthcare protocols',
  lawyer: 'Focus on legal knowledge, case analysis, and client advocacy',
  business_analyst: 'Focus on requirements gathering, process improvement, and documentation',
  content_creator: 'Focus on content strategy, audience engagement, and creative storytelling',
  journalist: 'Focus on news gathering, interviewing, and ethical reporting',
  civil_services: 'Focus on governance, policy implementation, and public administration',
  mechanical_engineer: 'Focus on design, thermodynamics, and manufacturing processes',
  electrical_engineer: 'Focus on circuit design, power systems, and electronics',
  hotel_management: 'Focus on hospitality operations, guest services, and staff management',
  banking: 'Focus on financial products, risk assessment, and regulatory compliance',
  general: 'Comprehensive behavioral and situational interview preparation',
};

export const experienceLabels: Record<ExperienceLevel, string> = {
  junior: 'Junior (0-2 years)',
  mid: 'Mid-Level (2-5 years)',
  senior: 'Senior (5-10 years)',
  lead: 'Lead/Principal (10+ years)',
};

export const interviewTypeLabels: Record<InterviewType, string> = {
  behavioral: 'Behavioral Interview',
  technical: 'Technical Interview',
  mixed: 'Mixed (Behavioral + Technical)',
};

export type InterviewStatus = 'pending' | 'preparing' | 'active' | 'completed';

export type AppPage = 'landing' | 'upload' | 'preparation' | 'interview' | 'feedback' | 'history';

export interface DetectedSkill {
  name: string;
  category: string;
  confidence: number;
}
