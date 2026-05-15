import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Loader2, Clock, AlertCircle, UploadCloud, 
  CheckCircle2, File as FileIcon, X, Send, BrainCircuit,
  ImagePlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState(null);
  
  // Format: 
  // MCQ: { [questionId]: "Option A" } 
  // Descriptive: { [questionId]: [FileObject1, FileObject2] }
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState('');

  // --- 1. Initialization (Fetch Data) ---
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error('Authentication required.');

        const response = await fetch(`${API_URL}/api/assignments/${id}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) throw new Error('Failed to load assignment.');

        const data = await response.json();
        setAssignment(data.assignment);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  // --- 2. Live Countdown Timer ---
  useEffect(() => {
    if (!assignment?.end_time) return;

    const timer = setInterval(() => {
      const distance = new Date(assignment.end_time).getTime() - new Date().getTime();
      
      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft('Time Expired');
        // Auto-submit if time runs out
        if (!isSubmitting && assignment) {
            toast.error("Time expired! Auto-submitting your test.");
            handleSubmit(); 
        }
      } else {
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [assignment, isSubmitting]);

  // --- 3. Input Handlers ---
  const handleMcqSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleMultipleFilesSelect = (questionId, newFiles) => {
    const filesArray = Array.from(newFiles);
    
    // Validate file sizes
    const invalidFile = filesArray.find(f => f.size > 5 * 1024 * 1024);
    if (invalidFile) {
      return toast.error('One or more files exceed the 5MB limit.');
    }

    setAnswers(prev => {
      const currentFiles = prev[questionId] || [];
      const updatedFiles = [...currentFiles, ...filesArray];
      
      // Enforce the 5 file limit mentioned in your upload.routes.js
      if (updatedFiles.length > 5) {
        toast.error('You can only upload up to 5 images per question.');
        return { ...prev, [questionId]: updatedFiles.slice(0, 5) };
      }
      
      return { ...prev, [questionId]: updatedFiles };
    });
  };

  const removeSpecificFile = (questionId, indexToRemove) => {
    setAnswers(prev => {
      const currentFiles = prev[questionId] || [];
      const updatedFiles = currentFiles.filter((_, idx) => idx !== indexToRemove);
      
      const newAnswers = { ...prev };
      if (updatedFiles.length === 0) {
        delete newAnswers[questionId];
      } else {
        newAnswers[questionId] = updatedFiles;
      }
      return newAnswers;
    });
  };

  // --- 4. The Submission Logic (Multiple Image Support) ---
  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < assignment.questions.length && timeLeft !== 'Time Expired') {
      const proceed = window.confirm(`You have only answered ${answeredCount}/${assignment.questions.length} questions. Submit anyway?`);
      if (!proceed) return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const finalAnswers = [];

      // Step 1: Upload Images (If Descriptive)
      if (assignment.type === 'DESCRIPTIVE') {
        const questionsWithAnswers = Object.entries(answers);
        let completedQuestions = 0;

        for (const [qId, files] of questionsWithAnswers) {
          setUploadProgress(`Uploading files for question ${completedQuestions + 1} of ${questionsWithAnswers.length}...`);
          
          const formData = new FormData();
          // Append all files for this specific question to 'examFiles'
          files.forEach(file => {
            formData.append('examFiles', file); 
          });

          // Call your updated upload endpoint
          const uploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` },
            body: formData
          });

          if (!uploadRes.ok) throw new Error(`Failed to upload images for question ${completedQuestions + 1}`);
          
          const uploadData = await uploadRes.json();
          
          // Push to final array using the new 'fileUrls' array structure
          finalAnswers.push({ 
            questionId: qId, 
            fileUrls: uploadData.fileUrls // Make sure your backend upload controller returns 'fileUrls' as an array
          });
          
          completedQuestions++;
        }
      } 
      // Handle MCQ Mapping
      else {
        setUploadProgress('Compiling responses...');
        for (const [qId, selectedOption] of Object.entries(answers)) {
          finalAnswers.push({ questionId: qId, selectedOption });
        }
      }

      // Step 2: Submit the Final Payload
      setUploadProgress('Finalizing submission...');
      
      const submitRes = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          assignmentId: id,
          answers: finalAnswers // Matches the new required payload perfectly
        })
      });

      if (!submitRes.ok) throw new Error('Submission failed at the server.');

      toast.success('Test Submitted Successfully!');
      navigate('/student-dashboard', { replace: true });

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // --- RENDERING ---
  if (isLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center text-text-dim font-sans">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-400" />
        <p className="font-display font-bold text-[14px] text-text-secondary tracking-wide">Initializing secure exam environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-bg-secondary border border-border-strong rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="font-display text-[18px] font-bold text-white mb-2">Error Loading Assessment</h2>
          <p className="text-text-secondary text-[13.5px] mb-6 leading-relaxed">{error}</p>
          <button onClick={() => navigate('/student-dashboard')} className="px-6 py-3 bg-bg-primary text-white hover:border-brand-400 border border-border-strong rounded-lg font-bold text-[13px] transition-colors font-display w-full">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isTimeCritical = timeLeft.includes('m ') && parseInt(timeLeft.split('h ')[1] || "0") < 10 && !timeLeft.includes('Time Expired');

  return (
    <div className="h-screen bg-bg-base text-text-primary font-sans flex flex-col overflow-hidden selection:bg-brand-400/30 selection:text-white">
      
      {/* ── Distraction-Free Header ── */}
      <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[68px] flex items-center justify-between px-6 lg:px-8 z-30">
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-9 h-9 rounded-full border border-brand-400/30 bg-brand-400/10 items-center justify-center shrink-0">
              <BrainCircuit size={15} className="text-brand-400" />
            </div>
          <div>
            <h1 className="font-display text-[16px] font-bold text-white tracking-wide leading-tight">{assignment.title}</h1>
            <div className="flex items-center gap-2 mt-0.5 text-text-dim text-[11px] font-display uppercase tracking-widest">
              <span className="text-brand-400 font-bold">{assignment.subject}</span>
              <span>•</span>
              <span>Secure Environment</span>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border font-bold text-[13px] font-display transition-colors ${isTimeCritical ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-bg-secondary border-border-strong text-white'}`}>
          <Clock className="w-4 h-4" />
          {timeLeft}
        </div>
      </header>

      {/* ── Scrollable Question Flow ── */}
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar pb-32">
        <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
          {assignment.questions.map((q, index) => (
            <div key={q.id} className="bg-bg-secondary border border-border-strong rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-bg-primary border border-border-strong font-display font-bold text-[14px] text-brand-400 shadow-inner">
                    {index + 1}
                  </span>
                  <p className="font-display text-[16px] font-bold text-white leading-relaxed mt-1">
                    {q.question_text}
                  </p>
                </div>
                <span className="flex-shrink-0 font-display text-[12px] font-bold text-text-secondary bg-bg-primary px-3 py-1 rounded-md border border-border-strong ml-4 mt-1">
                  {q.max_marks} pts
                </span>
              </div>

              {/* MCQ Render */}
              {assignment.type === 'MCQ' && (
                <div className="pl-13 space-y-3">
                  {q.mcq_options.map((option, optIdx) => {
                    const isSelected = answers[q.id] === option;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleMcqSelect(q.id, option)}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 border rounded-xl text-left transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'bg-brand-400/10 border-brand-400 shadow-[0_0_15px_rgba(216,90,48,0.15)] text-white' 
                            : 'bg-bg-primary border-border-strong text-text-secondary hover:border-text-dim hover:text-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-brand-400 bg-brand-400' : 'border-text-dim bg-bg-secondary'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-bg-base" />}
                        </div>
                        <span className="text-[14px] font-medium leading-snug">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Descriptive / Upload Render */}
              {assignment.type === 'DESCRIPTIVE' && (
                <div className="pl-13 mt-4">
                  {/* Render already uploaded files for this question */}
                  {answers[q.id] && answers[q.id].length > 0 && (
                    <div className="flex flex-col gap-3 mb-4">
                      {answers[q.id].map((file, fileIdx) => (
                        <div key={fileIdx} className="flex items-center justify-between p-3.5 bg-brand-400/10 border border-brand-400/30 rounded-xl">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2.5 bg-bg-primary border border-brand-400/20 rounded-lg">
                              <FileIcon className="w-5 h-5 text-brand-400" />
                            </div>
                            <div className="truncate">
                              <p className="text-[13.5px] font-bold text-white truncate font-display mb-0.5">
                                Page {fileIdx + 1}: {file.name}
                              </p>
                              <p className="text-[11px] text-brand-400 flex items-center gap-1 font-bold uppercase tracking-widest font-display">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeSpecificFile(q.id, fileIdx)} 
                            className="p-2 text-text-dim hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                            title="Remove Image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Dropzone (Hidden if max 5 files reached) */}
                  {(!answers[q.id] || answers[q.id].length < 5) && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-strong rounded-xl bg-bg-primary hover:border-brand-400 hover:bg-brand-400/5 cursor-pointer transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {answers[q.id]?.length > 0 ? (
                          <ImagePlus className="w-7 h-7 text-text-dim group-hover:text-brand-400 mb-2 transition-colors" />
                        ) : (
                          <UploadCloud className="w-7 h-7 text-text-dim group-hover:text-brand-400 mb-2 transition-colors" />
                        )}
                        <p className="mb-1 text-[13.5px] text-text-secondary">
                          <span className="font-bold text-white">
                            {answers[q.id]?.length > 0 ? "Add another page" : "Click to upload"}
                          </span> or drag image here
                        </p>
                        <p className="text-[11px] text-text-dim mt-1 font-display uppercase tracking-widest">
                          {answers[q.id]?.length || 0}/5 Images uploaded (Max 5MB)
                        </p>
                      </div>
                      <input 
                        type="file" className="hidden" accept="image/*" multiple
                        onChange={(e) => { if (e.target.files) handleMultipleFilesSelect(q.id, e.target.files); }}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* ── Floating Action Footer ── */}
      <div className="fixed bottom-0 left-0 w-full bg-bg-primary/95 backdrop-blur-md border-t border-border-strong p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-[12px] font-bold text-text-dim uppercase tracking-widest font-display hidden sm:block">
            Progress: <span className="text-white text-[14px] ml-1">{Object.keys(answers).length}</span> / {assignment.questions.length} Answered
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-4">
            {isSubmitting && <span className="text-[12px] font-bold text-brand-400 font-display uppercase tracking-widest animate-pulse">{uploadProgress}</span>}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-400 hover:bg-brand-600 text-white font-bold text-[14px] font-display rounded-lg transition-all shadow-brand hover:shadow-brand-hover hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSubmitting ? 'Processing...' : 'Submit Evaluation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;