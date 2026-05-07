import { useAuth } from '../context/AuthContext';
import { LogOut, BrainCircuit } from 'lucide-react';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-base-dark text-text-light font-sans p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-gray-900">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-brand-green" />
          <h1 className="text-2xl font-bold tracking-tight">Evaluator.ai</h1>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-base-card-dark border border-gray-800 rounded-xl hover:bg-gray-900 transition-colors text-text-dim hover:text-logo-red"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto py-12">
        <div className="bg-base-card-dark rounded-[24px] p-10 border border-gray-900 shadow-xl">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.user_metadata?.full_name || 'Instructor'}!</h2>
          <p className="text-text-dim mb-8">
            You are successfully logged in. This is your mock dashboard.
          </p>
          <div className="p-6 border border-gray-800 border-dashed rounded-2xl flex items-center justify-center bg-base-dark/50 min-h-[300px]">
            <p className="text-text-dim">Your B2B AI Exam Evaluator widgets will go here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;