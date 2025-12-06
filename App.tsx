import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, LEVELS_DATA, Level, Question, ExamResult } from './types';
import FloatingParticles from './components/FloatingParticles';
import { Button } from './components/Button';
import { generateLessonContent, generateExamQuestions } from './services/geminiService';
import { Award, BookOpen, Brain, CheckCircle, Lock, Play, Shield, Terminal, User, Moon, Sun, AlertCircle, Download, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
// @ts-ignore
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [levels, setLevels] = useState<Level[]>(LEVELS_DATA);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [lessonContent, setLessonContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<number[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [examAttempts, setExamAttempts] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Registration Form State
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    gender: 'Prefer not to say',
    qualification: '',
    background: '',
    nationality: '',
    profession: ''
  });

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const themeClasses = isDarkMode 
    ? "bg-darkBg text-white selection:bg-neonGreen selection:text-black" 
    : "bg-lightBg text-gray-900 selection:bg-neonGold selection:text-white";

  const cardClasses = isDarkMode
    ? "bg-glass border-neonGold/30 text-white"
    : "bg-white/80 border-metallicGreen/30 text-gray-900 shadow-lg";

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
    setView(AppView.DASHBOARD);
  };

  const handleStartLevel = async (level: Level) => {
    setCurrentLevel(level);
    setView(AppView.LESSON);
    setLessonContent("");
    setIsLoading(true);
    
    if (user) {
      const topics = level.topics.join(", ");
      const content = await generateLessonContent(user, topics, level.title);
      setLessonContent(content);
    }
    setIsLoading(false);
  };

  const completeLevel = () => {
    if (!currentLevel) return;
    
    const updatedLevels = levels.map(l => {
      if (l.id === currentLevel.id) {
        return { ...l, isCompleted: true };
      }
      if (l.id === currentLevel.id + 1) {
        return { ...l, isLocked: false };
      }
      return l;
    });
    
    setLevels(updatedLevels);
    setView(AppView.DASHBOARD);
  };

  const startExam = async () => {
    setIsLoading(true);
    try {
      const questions = await generateExamQuestions();
      setExamQuestions(questions);
      setExamAnswers(new Array(questions.length).fill(-1));
      setView(AppView.EXAM);
    } catch (e) {
      alert("Failed to load exam. Please check your connection or API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitExam = () => {
    let score = 0;
    examQuestions.forEach((q, idx) => {
      if (q.correctAnswerIndex === examAnswers[idx]) {
        score += 2; // 20 questions * 2 marks = 40 total
      }
    });

    const passed = score >= 30;
    setExamAttempts(prev => prev + 1);
    setExamResult({ score, passed, attempts: examAttempts + 1 });
    
    if (passed) {
      // Delay to show result then move to certificate
      setTimeout(() => setView(AppView.CERTIFICATE), 3000);
    }
  };

  const retryExam = () => {
    setExamResult(null);
    startExam();
  };

  const handleDownloadCertificate = async () => {
    setIsDownloading(true);
    const element = document.getElementById('certificate-view');
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2, // Higher quality
          backgroundColor: '#090909', // Ensure background consistency
          useCORS: true,
          logging: false
        });
        
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        const fileName = `Antigravity-Certificate-${user?.name.replace(/\s+/g, '-') || 'Cadet'}.png`;
        link.href = image;
        link.download = fileName;
        link.click();
      } catch (error) {
        console.error("Certificate download failed", error);
        alert("Could not generate image. Please try the Print/Save PDF option.");
      }
    }
    setIsDownloading(false);
  };

  const ProgressBar = () => {
    const completed = levels.filter(l => l.isCompleted).length;
    const total = levels.length;
    const percentage = (completed / total) * 100;
    
    return (
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex justify-between text-xs uppercase tracking-widest mb-2 opacity-70">
          <span>Academy Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-300'}`}>
          <div 
            className="h-full bg-gradient-to-r from-neonGold to-neonGreen transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Views
  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 z-10 relative">
       <button 
        onClick={toggleTheme} 
        className={`absolute top-6 right-6 p-2 rounded-full border ${isDarkMode ? 'border-neonGold text-neonGold' : 'border-metallicGreen text-metallicGreen'}`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`mb-8 p-6 border ${isDarkMode ? 'border-neonGold/30 bg-glass' : 'border-metallicGreen/20 bg-white/60'} backdrop-blur-md rounded-2xl animate-float transition-colors duration-500`}>
        <Brain className={`w-24 h-24 mx-auto mb-4 ${isDarkMode ? 'text-neonGold' : 'text-metallicGreen'}`} />
        <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonGold via-brightGold to-neonGreen drop-shadow-[0_0_10px_rgba(197,179,88,0.5)]">
          ANTIGRAVITY ACADEMY
        </h1>
        <p className={`mt-4 text-xl font-rajdhani tracking-widest uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Master the Future of Intelligence
        </p>
      </div>
      
      <div className={`max-w-2xl font-rajdhani text-lg mb-12 p-6 rounded-lg border-l-4 ${isDarkMode ? 'bg-black/50 text-gray-400 border-neonGreen' : 'bg-white/50 text-gray-800 border-metallicGreen shadow-md'}`}>
        <p>
          Welcome to the premier platform for AI literacy. Designed for beginners, engineered by experts. 
          Experience a personalized learning journey powered by <strong>Gemini 3 Pro</strong> using deep reasoning capabilities.
        </p>
      </div>

      <Button onClick={() => setView(AppView.REGISTER)} className="text-xl px-12 py-4">
        Initialize Sequence
      </Button>
    </div>
  );

  const renderRegister = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 z-10 relative">
      <div className={`w-full max-w-md backdrop-blur-xl border p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] ${cardClasses}`}>
        <h2 className={`text-3xl font-orbitron mb-6 text-center ${isDarkMode ? 'text-neonGold' : 'text-metallicGreen'}`}>Cadet Registration</h2>
        <form onSubmit={handleRegister} className="space-y-4 font-rajdhani">
          {[
            { label: 'Full Name', field: 'name' as keyof UserProfile },
            { label: 'Highest Qualification', field: 'qualification' as keyof UserProfile, placeholder: 'e.g. High School, PhD' },
            { label: 'Profession', field: 'profession' as keyof UserProfile, placeholder: 'e.g. Artist, Engineer' },
            { label: 'Study Background', field: 'background' as keyof UserProfile, placeholder: 'e.g. Arts, Science' },
          ].map((item) => (
            <div key={item.field}>
              <label className={`block text-sm uppercase tracking-wider mb-1 ${isDarkMode ? 'text-neonGreen' : 'text-metallicGreen'}`}>{item.label}</label>
              <input 
                required
                type="text" 
                placeholder={item.placeholder}
                className={`w-full border p-3 rounded outline-none transition-colors ${isDarkMode ? 'bg-darkBg/80 border-gray-700 focus:border-neonGold text-white' : 'bg-white border-gray-300 focus:border-metallicGreen text-black'}`}
                value={formData[item.field]}
                onChange={e => setFormData({...formData, [item.field]: e.target.value})}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className={`block text-sm uppercase tracking-wider mb-1 ${isDarkMode ? 'text-neonGreen' : 'text-metallicGreen'}`}>Nationality</label>
              <input 
                required
                type="text" 
                className={`w-full border p-3 rounded outline-none ${isDarkMode ? 'bg-darkBg/80 border-gray-700 focus:border-neonGold text-white' : 'bg-white border-gray-300 focus:border-metallicGreen text-black'}`}
                value={formData.nationality}
                onChange={e => setFormData({...formData, nationality: e.target.value})}
              />
            </div>
             <div>
              <label className={`block text-sm uppercase tracking-wider mb-1 ${isDarkMode ? 'text-neonGreen' : 'text-metallicGreen'}`}>Gender</label>
              <select 
                className={`w-full border p-3 rounded outline-none ${isDarkMode ? 'bg-darkBg/80 border-gray-700 focus:border-neonGold text-white' : 'bg-white border-gray-300 focus:border-metallicGreen text-black'}`}
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full">Confirm Identity</Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen pt-20 px-4 md:px-12 z-10 relative pb-20">
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-md border-b p-4 z-50 flex justify-between items-center transition-colors duration-300 ${isDarkMode ? 'bg-darkBg/90 border-gray-800' : 'bg-lightBg/90 border-gray-300'}`}>
        <div className="flex items-center gap-2">
          <Brain className={`${isDarkMode ? 'text-neonGold' : 'text-metallicGreen'} h-8 w-8`} />
          <span className={`font-orbitron text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Antigravity Academy</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700/20">
            {isDarkMode ? <Sun size={20} className="text-neonGold" /> : <Moon size={20} className="text-metallicGreen" />}
          </button>
          <div className="hidden md:flex items-center gap-4 text-sm font-rajdhani">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Cadet: <span className={isDarkMode ? 'text-neonGreen' : 'text-metallicGreen'}>{user?.name}</span></span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto mt-10">
        <h2 className={`text-4xl font-orbitron mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mission Control</h2>
        <p className={`font-rajdhani mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select your module to begin. Content is tailored to your profile.</p>

        <ProgressBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {levels.map((level) => (
            <div 
              key={level.id}
              className={`relative p-6 rounded-xl border transition-all duration-300 group
                ${level.isLocked 
                  ? `opacity-60 ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-300 bg-gray-200'}` 
                  : `cursor-pointer ${isDarkMode ? 'border-neonGold/30 bg-glass hover:bg-neonGold/10 hover:border-neonGold' : 'border-metallicGreen/30 bg-white hover:bg-green-50 hover:border-metallicGreen shadow-sm hover:shadow-md'}`
                }
              `}
              onClick={() => !level.isLocked && handleStartLevel(level)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`font-orbitron text-2xl ${isDarkMode ? 'text-neonGold/80' : 'text-metallicGreen/80'}`}>0{level.id}</span>
                {level.isCompleted ? (
                  <CheckCircle className="text-neonGreen h-6 w-6" />
                ) : level.isLocked ? (
                  <Lock className="text-gray-500 h-6 w-6" />
                ) : (
                  <Play className={`h-6 w-6 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-neonGold' : 'text-metallicGreen'}`} />
                )}
              </div>
              <h3 className={`text-xl font-bold font-orbitron mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{level.title}</h3>
              <p className={`text-sm font-rajdhani mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{level.description}</p>
              
              {!level.isLocked && !level.isCompleted && (
                 <div className={`text-xs font-mono animate-pulse ${isDarkMode ? 'text-neonGreen' : 'text-metallicGreen'}`}>Available for Access</div>
              )}
              {level.isCompleted && (
                 <div className="text-xs text-neonGold font-mono flex items-center gap-1">
                    <Award size={12} /> Badge Earned
                 </div>
              )}
            </div>
          ))}
        </div>

        {/* Badges Section */}
        <div className={`p-6 rounded-xl border mb-12 ${isDarkMode ? 'border-gray-800 bg-glass' : 'border-gray-200 bg-white/50'}`}>
          <h3 className={`text-xl font-orbitron mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Earned Badges</h3>
          <div className="flex flex-wrap gap-4">
            {levels.filter(l => l.isCompleted).length === 0 && (
              <p className="text-gray-500 italic text-sm">Complete modules to earn badges.</p>
            )}
            {levels.filter(l => l.isCompleted).map((level, i) => (
               <motion.div 
                 key={level.id} 
                 initial={{ opacity: 0, scale: 0.5, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 transition={{ 
                   type: "spring",
                   stiffness: 400,
                   damping: 20,
                   delay: i * 0.1 
                 }}
                 whileHover={{ scale: 1.05 }}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isDarkMode ? 'border-neonGold/50 bg-neonGold/10 text-neonGold' : 'border-metallicGreen/50 bg-green-100 text-metallicGreen'}`}
               >
                 <motion.div
                   animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                   transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                 >
                   <Award size={16} />
                 </motion.div>
                 <span className="font-orbitron text-sm">{level.badge}</span>
               </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className={`inline-block p-1 rounded-lg bg-gradient-to-r from-neonGold to-neonGreen`}>
            <div className={`rounded-lg p-8 ${isDarkMode ? 'bg-darkBg' : 'bg-white'}`}>
              <h3 className={`text-2xl font-orbitron mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Final Assessment</h3>
              <p className={`mb-6 max-w-lg mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Complete all levels to unlock the certification exam. Prove your mastery.
                <br/>
                <span className="text-sm opacity-70">(Pass mark: 30/40)</span>
              </p>
              <Button 
                onClick={startExam}
                disabled={!levels.every(l => l.isCompleted)}
                variant={levels.every(l => l.isCompleted) ? 'primary' : 'secondary'}
                className={!levels.every(l => l.isCompleted) ? 'opacity-50 grayscale cursor-not-allowed' : ''}
              >
                {levels.every(l => l.isCompleted) ? "Start Final Exam" : "Complete Modules First"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLesson = () => (
    <div className="min-h-screen pt-20 px-4 z-10 relative pb-20">
      <div className={`fixed top-0 left-0 right-0 backdrop-blur-md border-b p-4 z-50 flex justify-between ${isDarkMode ? 'bg-darkBg/95 border-gray-800' : 'bg-lightBg/95 border-gray-300'}`}>
        <Button onClick={() => setView(AppView.DASHBOARD)} variant="secondary" className="px-4 py-2 text-sm">Back to Base</Button>
        <div className="flex items-center gap-4">
            <span className={`font-orbitron hidden md:inline ${isDarkMode ? 'text-neonGold' : 'text-metallicGreen'}`}>{currentLevel?.title}</span>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700/20">
               {isDarkMode ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-black" />}
            </button>
        </div>
      </div>

      <div className={`max-w-4xl mx-auto mt-8 border rounded-2xl p-8 md:p-12 shadow-2xl ${isDarkMode ? 'bg-glass border-neonGreen/20 shadow-[0_0_50px_rgba(11,102,35,0.2)]' : 'bg-white border-metallicGreen/20 shadow-xl'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-32 h-32 mb-8">
               <div className={`absolute inset-0 rounded-full border-4 animate-ping ${isDarkMode ? 'border-neonGold/30' : 'border-metallicGreen/30'}`}></div>
               <div className={`absolute inset-0 rounded-full border-4 animate-pulse ${isDarkMode ? 'border-neonGreen/30' : 'border-brightGold/30'}`}></div>
               <Brain className={`absolute inset-0 m-auto h-16 w-16 animate-bounce ${isDarkMode ? 'text-neonGold' : 'text-metallicGreen'}`} />
            </div>
            <h3 className={`text-2xl font-orbitron text-center animate-pulse ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Consulting the Oracle...</h3>
            <p className="text-gray-500 font-rajdhani mt-2 text-center">Thinking Budget: 32k Tokens. Synthesizing knowledge for a {user?.profession}.</p>
          </div>
        ) : (
          <div className={`prose prose-lg max-w-none font-rajdhani ${isDarkMode ? 'prose-invert' : 'prose-stone'}`}>
             <div className="markdown-content">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className={`text-3xl font-orbitron border-b pb-4 mb-6 ${isDarkMode ? 'text-neonGold border-gray-700' : 'text-metallicGreen border-gray-300'}`} {...props} />,
                  h2: ({node, ...props}) => <h2 className={`text-2xl font-orbitron mt-8 mb-4 ${isDarkMode ? 'text-neonGreen' : 'text-green-700'}`} {...props} />,
                  strong: ({node, ...props}) => <strong className={isDarkMode ? 'text-brightGold' : 'text-yellow-600'} {...props} />,
                  ul: ({node, ...props}) => <ul className={`list-disc pl-6 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
                  p: ({node, ...props}) => <p className={`mb-4 leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`} {...props} />
                }}
              >
                {lessonContent}
              </ReactMarkdown>
             </div>
             
             <div className={`mt-12 pt-8 border-t flex justify-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
               <Button onClick={completeLevel} className="w-full md:w-auto text-xl">
                 Mark Module Complete <CheckCircle className="ml-2 inline" />
               </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderExam = () => (
    <div className="min-h-screen pt-20 px-4 z-10 relative pb-20">
       <div className="max-w-3xl mx-auto">
         {examResult ? (
           <div className={`text-center border p-8 rounded-2xl ${isDarkMode ? 'bg-glass border-gray-700' : 'bg-white border-gray-200 shadow-xl'}`}>
              <h2 className={`text-4xl font-orbitron mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assessment Complete</h2>
              
              <div className="relative inline-block mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    className="text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className={examResult.passed ? "text-neonGreen" : "text-red-500"}
                    strokeWidth="8"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * examResult.score) / 40}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold font-rajdhani ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{examResult.score}</span>
                  <span className="text-sm text-gray-500">/ 40</span>
                </div>
              </div>

              <p className={`text-2xl mb-8 font-bold ${examResult.passed ? 'text-neonGreen' : 'text-red-500'}`}>
                {examResult.passed ? "PASSED - CERTIFICATE UNLOCKED" : "FAILED - STUDY MORE"}
              </p>

              {/* Enhanced Feedback - Show wrong answers if failed */}
              {!examResult.passed && (
                 <div className="text-left mb-8 max-h-60 overflow-y-auto custom-scrollbar border p-4 rounded bg-red-900/10 border-red-500/20">
                    <h4 className="text-red-400 font-bold mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> Areas for Improvement:</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      {examQuestions.map((q, idx) => {
                         if (examAnswers[idx] !== q.correctAnswerIndex) {
                           return <li key={q.id}>Q{idx+1}: {q.questionText}</li>
                         }
                         return null;
                      })}
                    </ul>
                 </div>
              )}
              
              {!examResult.passed && examAttempts < 5 ? (
                <div className="space-y-4">
                  <p className="text-gray-500">Attempts remaining: {5 - examAttempts}</p>
                  <Button onClick={retryExam}>Retry Assessment (New Questions)</Button>
                </div>
              ) : !examResult.passed ? (
                <div className="text-red-400 border border-red-500/50 p-4 rounded bg-red-900/20">
                  Maximum attempts reached. Please review the course materials and reset your progress later.
                </div>
              ) : (
                <div className="animate-pulse">
                   <p className="text-neonGold mb-4">Redirecting to certification...</p>
                   <Button onClick={() => setView(AppView.CERTIFICATE)}>View Certificate Now</Button>
                </div>
              )}
           </div>
         ) : (
           <div className="space-y-8">
             <div className={`flex justify-between items-center font-orbitron ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>Final Examination</span>
                <span>Attempts: {examAttempts}/5</span>
             </div>
             
             {examQuestions.map((q, qIdx) => (
               <div key={q.id} className={`border p-6 rounded-xl transition-all ${isDarkMode ? 'bg-glass border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                 <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                   <span className="text-neonGold mr-2">Q{qIdx+1}.</span> {q.questionText}
                 </h3>
                 <div className="space-y-2">
                   {q.options.map((opt, oIdx) => (
                     <label key={oIdx} className={`flex items-center p-3 rounded cursor-pointer transition-colors border ${
                        examAnswers[qIdx] === oIdx 
                          ? 'bg-neonGold/20 border-neonGold' 
                          : isDarkMode ? 'border-transparent hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
                      }`}>
                       <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        className="mr-3"
                        checked={examAnswers[qIdx] === oIdx}
                        onChange={() => {
                          const newAnswers = [...examAnswers];
                          newAnswers[qIdx] = oIdx;
                          setExamAnswers(newAnswers);
                        }}
                       />
                       <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{opt}</span>
                     </label>
                   ))}
                 </div>
               </div>
             ))}

             <div className="flex justify-end pt-8">
                <Button 
                  onClick={submitExam} 
                  disabled={examAnswers.includes(-1)}
                  className={examAnswers.includes(-1) ? 'opacity-50' : ''}
                >
                  Submit Assessment
                </Button>
             </div>
           </div>
         )}
       </div>
    </div>
  );

  const renderCertificate = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 z-10 relative">
      <div id="certificate-view" className="relative w-full max-w-4xl bg-[#090909] border-4 border-neonGold p-8 md:p-12 text-center rounded-sm shadow-[0_0_80px_rgba(197,179,88,0.2)] text-white">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-neonGreen"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-neonGreen"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-neonGreen"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-neonGreen"></div>

        <div className="mb-8">
          <Award className="w-24 h-24 text-neonGold mx-auto animate-pulse-glow" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neonGold via-white to-neonGold mb-4 uppercase tracking-widest">
          Certificate of Mastery
        </h1>
        
        <p className="text-xl font-rajdhani text-gray-400 mb-8 uppercase tracking-widest">This certifies that</p>
        
        <h2 className="text-4xl md:text-5xl font-script text-neonGreen mb-8 border-b-2 border-gray-800 pb-4 inline-block px-12">
          {user?.name}
        </h2>
        
        <p className="text-lg font-rajdhani text-gray-300 max-w-2xl mx-auto leading-relaxed mb-12">
          Has successfully completed the Antigravity Academy Curriculum on Artificial Intelligence, 
          demonstrating proficiency in Neural Networks, Large Language Models, and Generative AI Ethics.
        </p>
        
        <div className="flex justify-center gap-8 mb-8">
           {levels.map(l => (
             <div key={l.id} className="flex flex-col items-center opacity-80">
                <Award className="text-neonGold h-8 w-8 mb-1" />
                <span className="text-[10px] uppercase text-gray-500">{l.badge}</span>
             </div>
           ))}
        </div>

        <div className="flex justify-between items-end mt-12 px-12">
           <div className="text-left">
             <div className="font-signature text-3xl text-neonGold mb-2">Antigravity Academy</div>
             <div className="w-48 h-px bg-gray-500 mb-2"></div>
             <p className="font-orbitron text-xs text-gray-500 uppercase">Authorized Signature</p>
           </div>
           <div className="text-right">
             <p className="font-orbitron text-lg text-neonGold">{new Date().toLocaleDateString()}</p>
             <p className="font-orbitron text-xs text-gray-500 uppercase">Date Issued</p>
           </div>
        </div>
      </div>
      
      <div className="mt-8 flex gap-4 print:hidden flex-wrap justify-center">
        <Button onClick={handleDownloadCertificate} isLoading={isDownloading}>
           <Download size={18} className="mr-2" /> Download Certificate
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
           <Printer size={18} className="mr-2" /> Print / PDF
        </Button>
        <Button variant="secondary" onClick={() => setView(AppView.DASHBOARD)}>Return to Base</Button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses} overflow-hidden font-rajdhani`}>
      {/* Background for Dark Mode */}
      {isDarkMode && <FloatingParticles />}
      
      {/* Background for Light Mode - subtle grid */}
      {!isDarkMode && (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(11,102,35,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(11,102,35,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      )}
      
      {/* View Switcher */}
      {view === AppView.LANDING && renderLanding()}
      {view === AppView.REGISTER && renderRegister()}
      {view === AppView.DASHBOARD && renderDashboard()}
      {view === AppView.LESSON && renderLesson()}
      {view === AppView.EXAM && renderExam()}
      {view === AppView.CERTIFICATE && renderCertificate()}

      {/* Footer */}
      <footer className={`fixed bottom-0 w-full backdrop-blur border-t py-3 text-center text-xs z-50 transition-colors ${isDarkMode ? 'bg-darkBg/90 border-gray-800 text-gray-600' : 'bg-lightBg/90 border-gray-300 text-gray-500'}`}>
        <p>© {new Date().getFullYear()} Antigravity Academy. Created by the Architect.</p>
      </footer>
    </div>
  );
};

export default App;