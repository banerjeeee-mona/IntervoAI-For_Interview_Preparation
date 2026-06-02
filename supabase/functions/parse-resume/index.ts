import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Skill categories and keywords for detection
const SKILL_DEFINITIONS: Record<string, { keywords: string[]; category: string }> = {
  // Programming Languages
  "JavaScript": { keywords: ["javascript", "js", "es6", "es2015", "ecmascript"], category: "Programming" },
  "TypeScript": { keywords: ["typescript", "ts"], category: "Programming" },
  "Python": { keywords: ["python", "py", "django", "flask", "fastapi", "pandas", "numpy", "scipy"], category: "Programming" },
  "Java": { keywords: ["java", "spring", "springboot", "hibernate", "maven", "gradle"], category: "Programming" },
  "C#": { keywords: ["c#", "csharp", "dotnet", ".net", "asp.net"], category: "Programming" },
  "C++": { keywords: ["c++", "cpp", "stl"], category: "Programming" },
  "Go": { keywords: ["golang", "go lang"], category: "Programming" },
  "Rust": { keywords: ["rust", "cargo"], category: "Programming" },
  "PHP": { keywords: ["php", "laravel", "symfony", "wordpress"], category: "Programming" },
  "Ruby": { keywords: ["ruby", "rails", "ruby on rails"], category: "Programming" },
  "Swift": { keywords: ["swift", "swiftui", "xcode"], category: "Programming" },
  "Kotlin": { keywords: ["kotlin", "android"], category: "Programming" },
  "R": { keywords: [" r ", "rstudio", "tidyverse", "ggplot"], category: "Programming" },
  "Scala": { keywords: ["scala", "spark", "apache spark"], category: "Programming" },

  // Frontend
  "React": { keywords: ["react", "reactjs", "react.js", "next.js", "nextjs", "gatsby"], category: "Frontend" },
  "Vue.js": { keywords: ["vue", "vuejs", "vue.js", "nuxt"], category: "Frontend" },
  "Angular": { keywords: ["angular", "angularjs"], category: "Frontend" },
  "HTML/CSS": { keywords: ["html", "css", "sass", "scss", "less", "tailwind", "bootstrap"], category: "Frontend" },
  "Redux": { keywords: ["redux", "zustand", "mobx", "recoil"], category: "Frontend" },

  // Backend
  "Node.js": { keywords: ["node.js", "nodejs", "express", "expressjs", "koa", "hapi"], category: "Backend" },
  "REST APIs": { keywords: ["rest api", "restful", "api development", "api design", "openapi"], category: "Backend" },
  "GraphQL": { keywords: ["graphql", "apollo"], category: "Backend" },
  "Microservices": { keywords: ["microservices", "micro-services", "service mesh"], category: "Backend" },

  // Databases
  "SQL": { keywords: ["sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "mssql", "t-sql", "pl/sql"], category: "Database" },
  "NoSQL": { keywords: ["nosql", "mongodb", "cassandra", "couchdb", "dynamodb", "firestore"], category: "Database" },
  "Redis": { keywords: ["redis", "cache", "memcached"], category: "Database" },
  "Elasticsearch": { keywords: ["elasticsearch", "elastic", "kibana"], category: "Database" },

  // Cloud & DevOps
  "AWS": { keywords: ["aws", "amazon web services", "ec2", "s3", "lambda", "rds", "cloudfront"], category: "Cloud" },
  "Azure": { keywords: ["azure", "microsoft azure", "azure devops"], category: "Cloud" },
  "GCP": { keywords: ["gcp", "google cloud", "bigquery", "cloud run"], category: "Cloud" },
  "Docker": { keywords: ["docker", "containerization", "dockerfile"], category: "DevOps" },
  "Kubernetes": { keywords: ["kubernetes", "k8s", "helm", "kubectl"], category: "DevOps" },
  "CI/CD": { keywords: ["ci/cd", "continuous integration", "jenkins", "github actions", "gitlab ci", "circleci"], category: "DevOps" },
  "Terraform": { keywords: ["terraform", "infrastructure as code", "iac", "pulumi"], category: "DevOps" },

  // Data & ML
  "Machine Learning": { keywords: ["machine learning", "ml", "deep learning", "neural network", "tensorflow", "pytorch", "keras", "scikit-learn"], category: "AI/ML" },
  "Data Science": { keywords: ["data science", "data analysis", "data analytics", "statistical analysis", "predictive modeling"], category: "Analytics" },
  "Data Visualization": { keywords: ["tableau", "power bi", "looker", "matplotlib", "seaborn", "d3.js", "plotly"], category: "Visualization" },
  "NLP": { keywords: ["nlp", "natural language processing", "text mining", "sentiment analysis"], category: "AI/ML" },

  // Tools
  "Git": { keywords: ["git", "github", "gitlab", "bitbucket", "version control"], category: "Tools" },
  "JIRA": { keywords: ["jira", "confluence", "atlassian", "agile", "scrum", "kanban"], category: "Tools" },
  "Linux": { keywords: ["linux", "unix", "bash", "shell scripting", "command line"], category: "Tools" },
  "Figma": { keywords: ["figma", "sketch", "adobe xd", "invision", "wireframe", "prototype"], category: "Design" },

  // Business Skills
  "Project Management": { keywords: ["project management", "pmp", "prince2", "program management"], category: "Management" },
  "Leadership": { keywords: ["leadership", "team lead", "manage team", "staff management", "mentoring"], category: "Soft Skills" },
  "Communication": { keywords: ["communication", "presentation", "stakeholder", "client-facing"], category: "Soft Skills" },
  "Product Management": { keywords: ["product management", "product roadmap", "product strategy", "ux research", "a/b testing"], category: "Product" },
  "Marketing": { keywords: ["marketing", "seo", "sem", "google ads", "social media", "content marketing", "email marketing"], category: "Marketing" },
  "Sales": { keywords: ["sales", "crm", "salesforce", "lead generation", "b2b", "account management"], category: "Sales" },
  "Finance": { keywords: ["financial analysis", "financial modeling", "accounting", "budgeting", "forecasting", "excel", "valuation"], category: "Finance" },
  "HR": { keywords: ["human resources", "recruitment", "talent acquisition", "employee relations", "hris", "performance management"], category: "HR" },
};

// Domain/profession detection patterns
const PROFESSION_PATTERNS: Record<string, { keywords: string[]; weight: number }> = {
  software_engineer: { keywords: ["software engineer", "software developer", "backend developer", "frontend developer", "fullstack", "full stack", "full-stack", "programming", "coding", "algorithm", "data structures", "system design", "microservices", "api development"], weight: 1 },
  data_scientist: { keywords: ["data scientist", "machine learning", "deep learning", "neural network", "tensorflow", "pytorch", "scikit-learn", "statistical modeling", "predictive modeling", "nlp", "computer vision"], weight: 1 },
  data_analyst: { keywords: ["data analyst", "data analysis", "business intelligence", "tableau", "power bi", "sql analyst", "data reporting", "kpi", "metrics", "data warehouse"], weight: 1 },
  web_developer: { keywords: ["web developer", "web development", "frontend", "react", "angular", "vue", "html", "css", "javascript", "responsive design", "ui development"], weight: 1 },
  ui_ux_designer: { keywords: ["ui designer", "ux designer", "product designer", "user experience", "user interface", "figma", "sketch", "wireframe", "prototyping", "design system", "usability"], weight: 1 },
  product_manager: { keywords: ["product manager", "product management", "product roadmap", "product strategy", "product owner", "go-to-market", "product vision"], weight: 1 },
  digital_marketing: { keywords: ["digital marketing", "seo", "sem", "google ads", "social media marketing", "content marketing", "email marketing", "marketing automation", "growth hacking"], weight: 1 },
  hr: { keywords: ["human resources", "hr manager", "talent acquisition", "recruiter", "recruitment", "employee engagement", "workforce planning", "hris"], weight: 1 },
  finance: { keywords: ["financial analyst", "finance manager", "investment banking", "financial modeling", "cfa", "cpa", "accounting", "controller", "cfo", "treasury"], weight: 1 },
  sales: { keywords: ["sales manager", "account executive", "business development", "sales representative", "quota", "revenue", "crm", "lead generation", "closing deals"], weight: 1 },
  business_analyst: { keywords: ["business analyst", "requirements gathering", "process improvement", "stakeholder management", "gap analysis", "use cases", "bpmn"], weight: 1 },
  lawyer: { keywords: ["attorney", "lawyer", "legal counsel", "litigation", "legal practice", "bar association", "juris doctor", "j.d.", "llm", "legal research"], weight: 1 },
  doctor: { keywords: ["physician", "doctor", "md", "m.d.", "medical doctor", "residency", "clinical", "patient care", "diagnosis", "medical license", "hospital"], weight: 1 },
  nurse: { keywords: ["registered nurse", "rn", "nursing", "clinical nurse", "patient care", "healthcare", "icu", "emergency nursing"], weight: 1 },
  teacher: { keywords: ["teacher", "educator", "professor", "instructor", "curriculum", "pedagogy", "classroom", "k-12", "higher education", "teaching"], weight: 1 },
  content_creator: { keywords: ["content creator", "content writer", "copywriter", "blogger", "social media", "youtube", "content strategy", "creative writing"], weight: 1 },
  journalist: { keywords: ["journalist", "reporter", "editor", "journalism", "news writing", "broadcast", "publishing", "editorial"], weight: 1 },
  mechanical_engineer: { keywords: ["mechanical engineer", "mechanical design", "cad", "solidworks", "autocad", "thermodynamics", "manufacturing", "product design", "fea", "ansys"], weight: 1 },
  electrical_engineer: { keywords: ["electrical engineer", "circuit design", "pcb", "embedded systems", "power systems", "control systems", "plc", "fpga", "verilog", "vhdl"], weight: 1 },
  hotel_management: { keywords: ["hotel management", "hospitality", "front desk", "housekeeping", "food and beverage", "guest services", "revenue management", "property management"], weight: 1 },
  banking: { keywords: ["banking", "banker", "credit analyst", "loan officer", "financial services", "risk management", "compliance", "aml", "kyc", "retail banking"], weight: 1 },
  customer_support: { keywords: ["customer support", "customer service", "help desk", "support specialist", "technical support", "customer success", "call center", "zendesk"], weight: 1 },
  civil_services: { keywords: ["civil service", "government", "public administration", "policy", "ias", "ips", "upsc", "municipal", "public sector"], weight: 1 },
};

// Extract text from different file types
async function extractTextFromFile(file: Uint8Array, mimeType: string, filename: string): Promise<string> {
  const lowerFilename = filename.toLowerCase();

  if (mimeType === "text/plain" || lowerFilename.endsWith(".txt")) {
    return new TextDecoder().decode(file);
  }

  if (mimeType === "application/pdf" || lowerFilename.endsWith(".pdf")) {
    return extractFromPDF(file);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerFilename.endsWith(".docx")
  ) {
    return extractFromDOCX(file);
  }

  if (
    mimeType === "application/msword" ||
    lowerFilename.endsWith(".doc")
  ) {
    // Basic DOC extraction - try to get readable text
    return extractFromDOC(file);
  }

  // Fallback: try to decode as text
  try {
    return new TextDecoder().decode(file);
  } catch {
    return "";
  }
}

// Simple PDF text extraction by scanning for text streams
function extractFromPDF(data: Uint8Array): string {
  const text = new TextDecoder("latin1").decode(data);
  const extractedParts: string[] = [];

  // Extract text between BT and ET markers (PDF text objects)
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(text)) !== null) {
    const block = match[1];
    // Extract Tj and TJ strings
    const tjRegex = /\(((?:[^()\\]|\\[\s\S])*)\)\s*Tj/g;
    const tjArrRegex = /\[((?:[^\[\]]*\([^)]*\)[^\[\]]*)*)\]\s*TJ/g;

    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const decoded = decodePDFString(tjMatch[1]);
      if (decoded.trim()) extractedParts.push(decoded);
    }

    while ((tjMatch = tjArrRegex.exec(block)) !== null) {
      const inner = tjMatch[1];
      const innerTj = /\(((?:[^()\\]|\\[\s\S])*)\)/g;
      let innerMatch;
      while ((innerMatch = innerTj.exec(inner)) !== null) {
        const decoded = decodePDFString(innerMatch[1]);
        if (decoded.trim()) extractedParts.push(decoded);
      }
    }
  }

  // Also try to find plain text patterns in newer PDFs
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  while ((match = streamRegex.exec(text)) !== null) {
    const streamContent = match[1];
    // Look for readable ASCII text chunks
    const readableText = streamContent.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    if (readableText.length > 20) {
      extractedParts.push(readableText);
    }
  }

  return extractedParts.join(" ").replace(/\s+/g, " ").trim();
}

function decodePDFString(s: string): string {
  return s
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\\\/g, "\\")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\[0-7]{3}/g, (oct) => String.fromCharCode(parseInt(oct.slice(1), 8)));
}

// DOCX extraction - DOCX files are ZIP archives containing XML
async function extractFromDOCX(data: Uint8Array): Promise<string> {
  // DOCX is a ZIP file. We'll look for word/document.xml content
  // by scanning the binary for XML-like content
  const text = new TextDecoder("utf-8", { fatal: false }).decode(data);

  // Find word/document.xml content embedded in the ZIP
  const xmlStart = text.indexOf("<w:document");
  const xmlEnd = text.lastIndexOf("</w:document>");

  if (xmlStart !== -1 && xmlEnd !== -1) {
    const xmlContent = text.slice(xmlStart, xmlEnd + 15);
    // Extract text from w:t tags
    const textParts: string[] = [];
    const wtRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let match;
    while ((match = wtRegex.exec(xmlContent)) !== null) {
      if (match[1].trim()) textParts.push(match[1]);
    }
    return textParts.join(" ").replace(/\s+/g, " ").trim();
  }

  // Fallback: extract any readable text
  return text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, 5000);
}

// Basic DOC extraction
function extractFromDOC(data: Uint8Array): string {
  const text = new TextDecoder("latin1", { fatal: false }).decode(data);
  // Extract readable ASCII sequences of reasonable length
  const words: string[] = [];
  const wordRegex = /[A-Za-z][A-Za-z0-9\-'.,@+#/]{2,}/g;
  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    words.push(match[0]);
  }
  return words.join(" ");
}

// Detect skills from text
function detectSkills(text: string): Array<{ name: string; category: string; confidence: number }> {
  const lowerText = text.toLowerCase();
  const detected: Array<{ name: string; category: string; confidence: number }> = [];

  for (const [skillName, { keywords, category }] of Object.entries(SKILL_DEFINITIONS)) {
    let maxConfidence = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // Higher confidence for exact longer matches
        const confidence = Math.min(95, 70 + keyword.length * 2);
        maxConfidence = Math.max(maxConfidence, confidence);
      }
    }
    if (maxConfidence > 0) {
      detected.push({ name: skillName, category, confidence: maxConfidence });
    }
  }

  // Sort by confidence descending, limit to top 15
  return detected.sort((a, b) => b.confidence - a.confidence).slice(0, 15);
}

// Detect profession from text
function detectProfession(text: string): string {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [profession, { keywords, weight }] of Object.entries(PROFESSION_PATTERNS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += weight * (keyword.length > 10 ? 2 : 1);
      }
    }
    if (score > 0) scores[profession] = score;
  }

  if (Object.keys(scores).length === 0) return "general";

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// Extract education info
function extractEducation(text: string): string[] {
  const education: string[] = [];
  const lowerText = text.toLowerCase();

  const degrees = [
    { pattern: /b\.?s\.?c?\.?|bachelor[s']? of science/i, label: "Bachelor of Science" },
    { pattern: /b\.?a\.?|bachelor[s']? of arts/i, label: "Bachelor of Arts" },
    { pattern: /b\.?e\.?|bachelor[s']? of engineering/i, label: "Bachelor of Engineering" },
    { pattern: /b\.?tech\.?|b\.?e\.?/i, label: "Bachelor of Technology" },
    { pattern: /m\.?s\.?c?\.?|master[s']? of science/i, label: "Master of Science" },
    { pattern: /m\.?a\.?|master[s']? of arts/i, label: "Master of Arts" },
    { pattern: /m\.?b\.?a\.?/i, label: "MBA" },
    { pattern: /m\.?tech\.?|m\.?e\.?/i, label: "Master of Technology" },
    { pattern: /ph\.?d\.?|doctorate/i, label: "PhD / Doctorate" },
    { pattern: /j\.?d\.?|juris doctor/i, label: "Juris Doctor" },
    { pattern: /m\.?d\.?|doctor of medicine/i, label: "Doctor of Medicine" },
  ];

  for (const { pattern, label } of degrees) {
    if (pattern.test(lowerText)) {
      education.push(label);
    }
  }

  // Extract university names
  const uniPatterns = [
    /university of [\w\s]+/gi,
    /[\w\s]+ university/gi,
    /[\w\s]+ college/gi,
    /[\w\s]+ institute of technology/gi,
    /iit [\w\s]+/gi,
    /[\w\s]+ school of/gi,
  ];

  for (const pattern of uniPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches.slice(0, 2)) {
        const clean = match.trim();
        if (clean.length > 5 && clean.length < 60 && !education.includes(clean)) {
          education.push(clean);
        }
      }
    }
  }

  return [...new Set(education)].slice(0, 5);
}

// Extract experience level
function extractExperienceLevel(text: string): string {
  const lowerText = text.toLowerCase();

  // Look for explicit year mentions
  const yearPatterns = [
    /(\d+)\+?\s*years?\s*of\s*experience/i,
    /(\d+)\+?\s*years?\s*in/i,
    /over\s*(\d+)\s*years?/i,
    /(\d+)\s*\+\s*years?/i,
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      const years = parseInt(match[1]);
      if (years >= 10) return "lead";
      if (years >= 5) return "senior";
      if (years >= 2) return "mid";
      return "junior";
    }
  }

  // Look for level indicators
  if (/senior|sr\.|principal|staff|architect|director|vp |cto|cio|head of/i.test(lowerText)) return "senior";
  if (/lead|manager|tech lead|team lead/i.test(lowerText)) return "lead";
  if (/junior|jr\.|entry.level|intern|fresher|graduate/i.test(lowerText)) return "junior";

  return "mid";
}

// Extract projects
function extractProjects(text: string): string[] {
  const projects: string[] = [];

  // Look for project section
  const projectSectionRegex = /(?:projects?|personal projects?|key projects?)[:\s]*\n([\s\S]*?)(?:\n[A-Z][A-Z\s]+:|\n\n[A-Z]|$)/i;
  const sectionMatch = text.match(projectSectionRegex);

  if (sectionMatch) {
    const section = sectionMatch[1];
    const lines = section.split("\n").filter(l => l.trim().length > 10 && l.trim().length < 100);
    projects.push(...lines.slice(0, 5).map(l => l.trim()));
  }

  // Look for lines starting with bullet points near project keywords
  const bulletProject = /[•\-\*]\s*([A-Z][^.!?\n]{10,80}(?:app|system|platform|tool|website|service|dashboard|api|bot|engine|framework))/gi;
  let match;
  while ((match = bulletProject.exec(text)) !== null) {
    if (projects.length < 5) projects.push(match[1].trim());
  }

  return [...new Set(projects)].slice(0, 5);
}

// Generate dynamic interview questions based on extracted resume data
function generateQuestions(
  profession: string,
  skills: Array<{ name: string; category: string; confidence: number }>,
  education: string[],
  experience: string,
  projects: string[],
  originalQuestions: string[]
): string[] {
  const questions: string[] = [...originalQuestions];

  // Inject skill-specific questions
  const topSkills = skills.slice(0, 5).map(s => s.name);

  if (topSkills.length > 0) {
    const skillQuestion = `I see you have experience with ${topSkills.slice(0, 3).join(", ")}. Can you walk me through a project where you used these technologies together?`;
    questions.splice(2, 0, skillQuestion);
  }

  if (projects.length > 0) {
    const projectQuestion = `Tell me more about one of your notable projects. What was the most challenging aspect and how did you overcome it?`;
    questions.splice(3, 0, projectQuestion);
  }

  if (education.length > 0) {
    const eduKeyword = education[0];
    if (eduKeyword.toLowerCase().includes("computer") || eduKeyword.toLowerCase().includes("science") || eduKeyword.toLowerCase().includes("engineering")) {
      questions.splice(1, 0, "How has your academic background prepared you for the challenges in this role?");
    }
  }

  // Experience level specific question
  if (experience === "senior" || experience === "lead") {
    questions.push("As a senior professional, how do you approach mentoring junior team members while maintaining your own productivity?");
  } else if (experience === "junior") {
    questions.push("What strategies do you use to quickly learn new technologies or processes on the job?");
  }

  return questions.slice(0, 10); // Cap at 10 questions
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let resumeText = "";
    let filename = "resume.txt";
    let mimeType = "text/plain";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const textInput = formData.get("text") as string | null;

      if (file) {
        filename = file.name;
        mimeType = file.type || "application/octet-stream";
        const buffer = await file.arrayBuffer();
        const fileData = new Uint8Array(buffer);
        resumeText = await extractTextFromFile(fileData, mimeType, filename);
      }

      if (!resumeText && textInput) {
        resumeText = textInput;
      }
    } else {
      // JSON body with text
      const body = await req.json();
      resumeText = body.text || "";
      filename = body.filename || "resume.txt";
      mimeType = body.mimeType || "text/plain";
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from the uploaded file. Please try pasting your resume text directly." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze the resume
    const skills = detectSkills(resumeText);
    const profession = detectProfession(resumeText);
    const education = extractEducation(resumeText);
    const experienceLevel = extractExperienceLevel(resumeText);
    const projects = extractProjects(resumeText);

    // Summary of extracted info
    const summary = {
      wordCount: resumeText.split(/\s+/).length,
      topSkills: skills.slice(0, 5).map(s => s.name),
      profession,
      experienceLevel,
      education: education.slice(0, 3),
      projectCount: projects.length,
    };

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: resumeText.slice(0, 3000), // return first 3000 chars
        skills,
        profession,
        experienceLevel,
        education,
        projects,
        summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-resume error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process resume. Please try pasting your resume text instead." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
