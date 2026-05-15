import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2,
  AlignLeft, CheckSquare, Settings2, Target, Clock, BookOpen,
  Image as ImageIcon, CheckCircle2, BrainCircuit, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Enums ─── */
const DEPARTMENTS = [
  { value: 'COMPUTER_SCIENCE_ENGINEERING', label: 'Computer Science Engineering' },
  { value: 'ELECTRONICS_AND_COMMUNICATION_ENGINEERING', label: 'Electronics & Comm. Engineering' },
  { value: 'ELECTRICAL_AND_ELECTRONICS_ENGINEERING', label: 'Electrical & Electronics Eng.' },
  { value: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering' },
  { value: 'CIVIL_ENGINEERING', label: 'Civil Engineering' },
  { value: 'AUTOMOBILE_ENGINEERING', label: 'Automobile Engineering' },
  { value: 'CHEMICAL_ENGINEERING', label: 'Chemical Engineering' },
  { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology' },
  { value: 'BIOTECHNOLOGY', label: 'Biotechnology' },
  { value: 'PETROLEUM_ENGINEERING', label: 'Petroleum Engineering' },
  { value: 'AEROSPACE_ENGINEERING', label: 'Aerospace Engineering' },
  { value: 'METALLURGICAL_ENGINEERING', label: 'Metallurgical Engineering' },
  { value: 'INDUSTRIAL_ENGINEERING', label: 'Industrial Engineering' },
  { value: 'ENVIRONMENTAL_ENGINEERING', label: 'Environmental Engineering' },
  { value: 'DATA_SCIENCE_ENGINEERING', label: 'Data Science Engineering' },
  { value: 'ARTIFICIAL_INTELLIGENCE_ENGINEERING', label: 'Artificial Intelligence Eng.' },
  { value: 'ROBOTICS_ENGINEERING', label: 'Robotics Engineering' },
];
const ACADEMIC_YEARS = [
  { value: 'BTECH_YEAR_1', label: 'B.Tech – 1st Year' },
  { value: 'BTECH_YEAR_2', label: 'B.Tech – 2nd Year' },
  { value: 'BTECH_YEAR_3', label: 'B.Tech – 3rd Year' },
  { value: 'BTECH_YEAR_4', label: 'B.Tech – 4th Year' },
  { value: 'MTECH_YEAR_1', label: 'M.Tech – 1st Year' },
  { value: 'MTECH_YEAR_2', label: 'M.Tech – 2nd Year' },
];
const BATCHES = Array.from({ length: 10 }, (_, i) => ({
  value: `BATCH_${i + 1}`,
  label: `Batch ${i + 1}`,
}));

const generateId = () => Math.random().toString(36).substr(2, 9);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/* ─── Component ─── */
const CreateAssignment = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle]                   = useState('');
  const [subject, setSubject]               = useState('');
  const [department, setDepartment]         = useState('COMPUTER_SCIENCE_ENGINEERING');
  const [year, setYear]                     = useState('BTECH_YEAR_1');
  const [batch, setBatch]                   = useState('BATCH_1');
  const [startTime, setStartTime]           = useState('');
  const [endTime, setEndTime]               = useState('');
  const [releaseMarksAt, setReleaseMarksAt] = useState('');
  const [type, setType]                     = useState('MCQ');
  
  // New field required by backend for RAG evaluation
  const [syllabusText, setSyllabusText]     = useState('');

  const getEmptyQuestion = (t) =>
    t === 'MCQ'
      ? { id: generateId(), text: '', marks: 5, options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', image_file: null }
      : { id: generateId(), text: '', marks: 10, model_answer: '', image_file: null };

  const [questions, setQuestions] = useState([getEmptyQuestion('MCQ')]);

  const handleTypeChange = (newType) => {
    if (newType === type) return;
    if (questions.length > 1 || questions[0].text !== '') {
      if (!window.confirm('Changing type will clear all current questions. Continue?')) return;
    }
    setType(newType);
    setQuestions([getEmptyQuestion(newType)]);
  };

  const handleAddQuestion    = () => setQuestions([...questions, getEmptyQuestion(type)]);
  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) return toast.error('Need at least one question.');
    setQuestions(questions.filter(q => q.id !== id));
  };
  const updateQuestion = (id, field, value) =>
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  const updateOption = (qid, idx, val) =>
    setQuestions(questions.map(q => {
      if (q.id !== qid) return q;
      const opts = [...q.options]; opts[idx] = val;
      return { ...q, options: opts };
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || !startTime || !endTime || !releaseMarksAt)
      return toast.error('Fill in all required metadata and time locks.');
    if (type === 'DESCRIPTIVE' && !syllabusText)
      return toast.error('Syllabus context is required for AI Descriptive Grading.');

    setIsLoading(true);
    try {
      const { data: { session }, error: se } = await supabase.auth.getSession();
      if (se || !session) throw new Error('Authentication error. Please log in again.');

      const finalQuestions = await Promise.all(questions.map(async (q) => {
        let uploadedUrl = null;
        if (q.image_file) {
          const fd = new FormData(); fd.append('examFile', q.image_file);
          const up = await fetch(`${API_URL}/api/upload`, {
            method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` }, body: fd,
          });
          if (!up.ok) throw new Error('Failed to upload image for a question.');
          uploadedUrl = (await up.json()).fileUrl;
        }
        
        // Match exact JSON keys requested in blueprint
        const base = { 
          question_text: q.text, 
          max_marks: Number(q.marks), 
          ...(uploadedUrl && { image_url: uploadedUrl }) 
        };
        
        if (type === 'MCQ') return {
          ...base,
          mcq_options: q.options.map((o, i) => `${String.fromCharCode(65+i)}. ${o}`),
          mcq_answer: `${String.fromCharCode(65+q.correctOptionIndex)}. ${q.options[q.correctOptionIndex]}`,
          mcq_explanation: q.explanation,
        };
        
        return { ...base, model_answer: q.model_answer };
      }));

      const res = await fetch(`${API_URL}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ 
          title, type, subject, 
          start_time: new Date(startTime).toISOString(), 
          end_time: new Date(endTime).toISOString(), 
          release_marks_at: new Date(releaseMarksAt).toISOString(), 
          department, year, batch, 
          syllabus_text: syllabusText, // Added RAG Context
          questions: finalQuestions 
        }),
      });
      
      if (!res.ok) { 
        const d = await res.json().catch(()=>({})); 
        throw new Error(d.message || 'Failed to create assignment'); 
      }
      
      toast.success('Assignment published successfully!');
      navigate('/teacher-dashboard');
    } catch (err) {
      console.error(err); toast.error(err.message || 'Unexpected error.');
    } finally { setIsLoading(false); }
  };

  // Base select input styling for reuse
  const selectClass = "w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all cursor-pointer appearance-none";
  const selectBg = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C8C5BC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' };

  return (
    <div className="h-screen bg-bg-base text-text-primary font-sans flex flex-col overflow-hidden selection:bg-brand-400/30 selection:text-white">

      {/* ── Header (App-like & Fixed) ── */}
      <header className="shrink-0 bg-bg-primary/90 backdrop-blur-lg border-b border-border-strong h-[64px] flex items-center justify-between px-6 lg:px-8 z-30">
        <div className="flex items-center gap-4">
          <button 
            className="w-9 h-9 rounded-[8px] bg-bg-secondary border border-border-strong flex items-center justify-center text-text-secondary hover:text-white hover:border-brand-400 transition-colors" 
            onClick={() => navigate(-1)} 
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3 border-l border-border-strong pl-4 ml-1">
            <div className="hidden sm:flex w-8 h-8 rounded-full border border-brand-400 bg-brand-400/10 items-center justify-center shrink-0">
              <BrainCircuit size={14} className="text-brand-400" />
            </div>
            <h1 className="font-display text-[17px] font-bold text-white tracking-wide">
              Create Assignment
            </h1>
          </div>
        </div>
        
        <button 
          className="flex items-center gap-2 px-6 py-[10px] bg-brand-400 text-white font-bold rounded-[8px] font-display shadow-brand hover:-translate-y-[1px] hover:bg-brand-600 transition-all text-[13.5px] disabled:opacity-60 disabled:hover:translate-y-0" 
          onClick={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Publish Test
        </button>
      </header>

      {/* ── Scrollable Body ── */}
      <main className="flex-1 overflow-y-auto w-full pb-20 custom-scrollbar">
        <div className="max-w-[1520px] mx-auto p-6 lg:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ── LEFT ASIDE (Metadata) ── */}
            <aside className="lg:col-span-4 flex flex-col gap-6">

              {/* General Details */}
              <div className="bg-bg-secondary border border-border-strong rounded-[14px] overflow-hidden shadow-sm">
                <div className="px-5 py-[14px] border-b border-border-strong bg-bg-primary flex items-center gap-2.5">
                  <BookOpen size={15} className="text-brand-400" />
                  <h2 className="font-display font-bold text-[14.5px] text-white tracking-wide">General Details</h2>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Title *</label>
                    <input className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted" type="text" placeholder="e.g. Midterm Examination" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Subject Code/Name *</label>
                    <input className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted" type="text" placeholder="e.g. CS201 Data Structures" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* RAG Syllabus Context */}
              <div className="bg-bg-secondary border border-brand-400/30 rounded-[14px] overflow-hidden shadow-brand relative group">
                <div className="absolute inset-0 bg-brand-400/5 pointer-events-none"></div>
                <div className="px-5 py-[14px] border-b border-border-strong bg-bg-primary flex items-center gap-2.5 relative z-10">
                  <Sparkles size={15} className="text-brand-400" />
                  <h2 className="font-display font-bold text-[14.5px] text-white tracking-wide flex items-center gap-2">
                    AI RAG Context 
                    <span className="text-[9px] bg-brand-400/20 text-brand-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Required</span>
                  </h2>
                </div>
                <div className="p-5 relative z-10">
                  <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2 font-display">Syllabus / Reference Text</label>
                  <p className="text-[12px] text-text-secondary mb-3 leading-relaxed">Paste the exact syllabus topics, rules, or formulas here. The AI will use this semantic context to grade student answers accurately and check for out-of-syllabus concepts.</p>
                  <textarea 
                    className="w-full px-3 py-3 bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted resize-y" 
                    rows={4}
                    placeholder="e.g. Unit 1: Binary Search Trees. Properties, rotations, AVL balancing..." 
                    value={syllabusText} 
                    onChange={e => setSyllabusText(e.target.value)} 
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-bg-secondary border border-border-strong rounded-[14px] overflow-hidden shadow-sm">
                <div className="px-5 py-[14px] border-b border-border-strong bg-bg-primary flex items-center gap-2.5">
                  <Target size={15} className="text-teal-400" />
                  <h2 className="font-display font-bold text-[14.5px] text-white tracking-wide">Target Audience</h2>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Department</label>
                    <select className={selectClass} style={selectBg} value={department} onChange={e => setDepartment(e.target.value)}>
                      {DEPARTMENTS.map(d => <option key={d.value} value={d.value} className="bg-bg-secondary">{d.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Year</label>
                      <select className={selectClass} style={selectBg} value={year} onChange={e => setYear(e.target.value)}>
                        {ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value} className="bg-bg-secondary">{y.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Batch</label>
                      <select className={selectClass} style={selectBg} value={batch} onChange={e => setBatch(e.target.value)}>
                        {BATCHES.map(b => <option key={b.value} value={b.value} className="bg-bg-secondary">{b.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-bg-secondary border border-border-strong rounded-[14px] overflow-hidden shadow-sm">
                <div className="px-5 py-[14px] border-b border-border-strong bg-bg-primary flex items-center gap-2.5">
                  <Clock size={15} className="text-amber-400" />
                  <h2 className="font-display font-bold text-[14.5px] text-white tracking-wide">Schedule & Time Locks</h2>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Start Time (Opens) *</label>
                    <input className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-amber-400 focus:bg-bg-hover transition-all [color-scheme:dark]" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">End Time (Deadline) *</label>
                    <input className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-amber-400 focus:bg-bg-hover transition-all [color-scheme:dark]" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                  <div className="pt-2 border-t border-border-strong">
                    <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Release Marks At *</label>
                    <input className="w-full px-3 py-[10px] bg-bg-primary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all [color-scheme:dark]" type="datetime-local" value={releaseMarksAt} onChange={e => setReleaseMarksAt(e.target.value)} />
                  </div>
                </div>
              </div>

            </aside>

            {/* ── RIGHT COLUMN (Questions) ── */}
            <div className="lg:col-span-8 flex flex-col gap-8">

              {/* Test Format Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: 'MCQ', Icon: CheckSquare, label: 'Multiple Choice (MCQ)', desc: 'Auto-graded with specific correct options.' },
                  { t: 'DESCRIPTIVE', Icon: AlignLeft, label: 'Descriptive / Theory', desc: 'AI-graded open-ended answers against a model.' },
                ].map(({ t, Icon, label, desc }) => {
                  const isActive = type === t;
                  return (
                    <button 
                      key={t} 
                      type="button" 
                      className={`flex flex-col items-start p-5 rounded-[12px] border-2 transition-all text-left gap-2 cursor-pointer ${
                        isActive 
                          ? 'border-brand-400 bg-brand-400/10 shadow-brand' 
                          : 'border-border-strong bg-bg-secondary hover:border-border-hi'
                      }`} 
                      onClick={() => handleTypeChange(t)}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1 ${isActive ? 'bg-brand-400 text-white shadow-glow' : 'bg-bg-primary border border-border-strong text-text-dim'}`}>
                        <Icon size={18} />
                      </div>
                      <h3 className={`font-display font-bold text-[15px] ${isActive ? 'text-white' : 'text-text-secondary'}`}>{label}</h3>
                      <p className="text-[12px] text-text-dim leading-relaxed">{desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Question Builder List */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-border-strong pb-3">
                  <h2 className="font-display font-bold text-[17px] text-white flex items-center gap-2">
                    <Settings2 size={18} className="text-text-dim" />
                    Question Builder
                  </h2>
                  <span className="bg-bg-secondary border border-border-strong px-3 py-1 rounded-full text-[11px] font-bold text-text-secondary uppercase tracking-widest font-display">
                    {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-bg-secondary border border-border-strong rounded-[14px] p-6 relative group">
                      
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-8 h-8 rounded-full bg-bg-primary border border-border-strong flex items-center justify-center font-display font-bold text-[13px] text-brand-400">
                          {idx + 1}
                        </div>
                        <button 
                          type="button" 
                          className="w-8 h-8 flex items-center justify-center rounded-md text-text-dim hover:bg-red-500/10 hover:text-red-500 transition-colors" 
                          onClick={() => handleRemoveQuestion(q.id)}
                          title="Delete Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Question text / image / marks */}
                      <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_100px] gap-4">
                          <div>
                            <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Question Text *</label>
                            <textarea
                              className="w-full px-3 py-3 bg-bg-primary border border-border-strong rounded-[8px] text-[13.5px] text-white focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all placeholder:text-text-muted resize-y"
                              rows={2}
                              placeholder="Enter your question here…"
                              value={q.text}
                              onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Marks</label>
                            <input 
                              className="w-full px-3 py-[10.5px] bg-bg-primary border border-border-strong rounded-[8px] text-[15px] font-bold text-brand-400 focus:outline-none focus:border-brand-400 focus:bg-bg-hover transition-all text-center" 
                              type="number" min="1" 
                              value={q.marks} 
                              onChange={e => updateQuestion(q.id, 'marks', e.target.value)} 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Diagram (Optional)</label>
                          <label className={`w-fit flex items-center gap-2 px-4 py-2 rounded-[8px] border transition-all cursor-pointer font-medium text-[12.5px] ${q.image_file ? 'bg-brand-400/10 border-brand-400 text-brand-400' : 'bg-bg-primary border-border-strong text-text-secondary hover:border-brand-400 hover:text-white'}`}>
                            {q.image_file ? <CheckCircle2 size={15} /> : <ImageIcon size={15} />}
                            <span className="max-w-[200px] truncate">
                              {q.image_file ? q.image_file.name : 'Upload Image'}
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => updateQuestion(q.id, 'image_file', e.target.files[0])} />
                          </label>
                        </div>

                        {/* Formatting based on Type */}
                        {type === 'MCQ' ? (
                          <div className="mt-2 bg-bg-primary border border-border-strong rounded-[10px] p-5">
                            <label className="block text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-3 font-display">Answer Options</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                              {['A', 'B', 'C', 'D'].map((letter, oi) => (
                                <div key={letter} className="flex items-center gap-3">
                                  <span className="flex items-center justify-center w-7 h-7 rounded bg-bg-secondary border border-border-strong text-[12px] font-bold text-text-secondary shrink-0 font-display">
                                    {letter}
                                  </span>
                                  <input
                                    className="w-full px-3 py-2 bg-bg-secondary border border-border-strong rounded-[6px] text-[13px] text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-text-muted"
                                    type="text"
                                    placeholder={`Option ${letter}`}
                                    value={q.options[oi]}
                                    onChange={e => updateOption(q.id, oi, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-strong">
                              <div>
                                <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Correct Answer</label>
                                <select className={selectClass} style={selectBg} value={q.correctOptionIndex} onChange={e => updateQuestion(q.id, 'correctOptionIndex', Number(e.target.value))}>
                                  {['A', 'B', 'C', 'D'].map((l, i) => <option key={l} value={i} className="bg-bg-secondary">Option {l}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10.5px] font-bold text-text-dim uppercase tracking-[0.1em] mb-1.5 font-display">Explanation (Optional)</label>
                                <input className="w-full px-3 py-[10px] bg-bg-secondary border border-border-strong rounded-[8px] text-[13px] text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-text-muted" type="text" placeholder="Why is this answer correct?" value={q.explanation} onChange={e => updateQuestion(q.id, 'explanation', e.target.value)} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 bg-brand-400/5 border border-brand-400/20 rounded-[10px] p-5">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-brand-400 uppercase tracking-[0.1em] mb-3 font-display">
                              <CheckCircle2 size={14} /> Model Answer (For AI Grading)
                            </label>
                            <textarea
                              className="w-full px-3 py-3 bg-bg-primary border border-border-strong rounded-[8px] text-[13.5px] text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-text-muted resize-y"
                              rows={4}
                              placeholder="Write the ideal, complete answer here. The AI will cross-reference this and your Syllabus Text to grade student submissions."
                              value={q.model_answer}
                              onChange={e => updateQuestion(q.id, 'model_answer', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button" 
                    className="w-full py-4 rounded-[12px] border-2 border-dashed border-border-strong text-text-secondary hover:border-brand-400 hover:text-brand-400 hover:bg-brand-400/5 flex items-center justify-center gap-2 font-display font-bold transition-all bg-bg-primary/50 text-[14px]" 
                    onClick={handleAddQuestion}
                  >
                    <Plus size={18} /> Add Another Question
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAssignment;