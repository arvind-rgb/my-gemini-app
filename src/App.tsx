/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Send, 
  Loader2, 
  Moon, 
  Sun,
  ChevronRight,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import { getHoroscope, askFollowUp } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BirthDetails {
  name: string;
  dob: string;
  tob: string;
  pob: string;
}

export default function App() {
  const [details, setDetails] = useState<BirthDetails>({
    name: '',
    dob: '',
    tob: '',
    pob: '',
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; parts: { text: string }[] }[]>([]);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.dob || !details.tob || !details.pob) return;

    setLoading(true);
    try {
      // Format date from YYYY-MM-DD to DD MM YYYY for the service
      const [year, month, day] = details.dob.split('-');
      const formattedDob = `${day} ${month} ${year}`;
      
      const result = await getHoroscope({ ...details, dob: formattedDob });
      setReport(result);
      setChatHistory([
        { role: "user", parts: [{ text: `My name is ${details.name}, born ${formattedDob} at ${details.tob} in ${details.pob}. Please analyze my jathakam.` }] },
        { role: "model", parts: [{ text: result }] }
      ]);
      
      // Scroll to report
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error fetching horoscope:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || chatLoading) return;

    const userQuestion = question;
    setQuestion('');
    setChatLoading(true);
    
    const newHistory = [...chatHistory, { role: "user" as const, parts: [{ text: userQuestion }] }];
    setChatHistory(newHistory);

    try {
      const result = await askFollowUp(chatHistory, userQuestion);
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: result }] }]);
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const reset = () => {
    setReport(null);
    setChatHistory([]);
    setDetails({ name: '', dob: '', tob: '', pob: '' });
  };

  return (
    <div className="min-h-screen bg-[#1a0b2e] text-slate-200 font-sans selection:bg-fuchsia-500/30">
      {/* Background Patterns - Astrological Signs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.05]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="astro-pattern" width="150" height="150" patternUnits="userSpaceOnUse">
                {/* Aries */}
                <path d="M 20 20 C 15 10 25 10 20 20 C 15 30 25 30 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Taurus */}
                <circle cx="60" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 50 20 Q 60 10 70 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Gemini */}
                <path d="M 100 20 L 100 40 M 110 20 L 110 40 M 95 20 L 115 20 M 95 40 L 115 40" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Cancer */}
                <circle cx="25" cy="75" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 30 75 Q 45 60 45 75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="55" cy="75" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 50 75 Q 35 90 35 75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Leo */}
                <circle cx="90" cy="80" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 94 80 Q 110 70 110 90" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Virgo */}
                <path d="M 20 120 Q 25 100 30 120 Q 35 100 40 120 Q 45 100 45 130" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Libra */}
                <path d="M 70 120 L 100 120 M 70 130 L 100 130 Q 85 110 70 130" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Scorpio */}
                <path d="M 120 110 Q 125 90 130 110 Q 135 90 140 110 L 145 120" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#astro-pattern)" />
          </svg>
        </div>
      </div>

      <main className="relative max-w-4xl mx-auto px-4 py-12">
        {/* Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl mb-12"
        >
          <img 
            src="https://ik.imagekit.io/bhookle/Gemini_Generated_Image_rlmkbfrlmkbfrlmk.png" 
            alt="Ask Arvind Baba" 
            className="w-full h-auto object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback if image is missing
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/astrology/1200/600';
            }}
          />
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a0b2e]/90 backdrop-blur-md"
          >
            <img 
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXN6eXN6eXN6eXN6eXN6eXN6eXN6eXN6eXN6eXN6eXN6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif" 
              alt="Loading..." 
              className="w-64 h-64 rounded-full border-4 border-amber-500 shadow-2xl shadow-amber-500/20 mb-8 object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/cosmos/400/400';
              }}
            />
            <h2 className="text-3xl font-bold text-amber-400 animate-pulse">Bargaining with the Navagrahas...</h2>
            <p className="text-slate-400 mt-4 text-center max-w-md px-6 italic">
              "Baba is currently convincing Saturn that you're a nice person. This might take a second..."
            </p>
          </motion.div>
        )}

        {!report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 text-center"
          >
            <div className="inline-block p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-bold text-amber-400 mb-2">The Legend of Arvind Baba</h3>
              <p className="text-slate-400 italic leading-relaxed">
                "Arvind Baba didn't choose the stars; the stars chose him after a particularly strong filter coffee in T-Nagar. 
                Part-time mystic, full-time vibe-checker, he decodes celestial drama using ancient Tamil wisdom and a healthy dose of sass. 
                He doesn't just read your Jathakam—he negotiates with Saturn on your behalf. Namaste-ish!"
              </p>
            </div>
          </motion.div>
        )}

        {!report ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Enter Birth Details</h2>
                <p className="text-slate-500 text-sm">Precision is key for a true Arulvakku.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={details.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Calendar size={14} /> Date of Birth
                </label>
                <div className="relative group">
                  <input
                    required
                    type="date"
                    name="dob"
                    value={details.dob}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none color-scheme-dark"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-amber-400 transition-colors" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Clock size={14} /> Time of Birth
                </label>
                <div className="relative group">
                  <input
                    required
                    type="time"
                    name="tob"
                    value={details.tob}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none color-scheme-dark"
                  />
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-amber-400 transition-colors" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <MapPin size={14} /> Place of Birth
                </label>
                <input
                  required
                  type="text"
                  name="pob"
                  value={details.pob}
                  onChange={handleInputChange}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Bargaining with the Navagrahas...
                    </>
                  ) : (
                    <>
                      Generate My Jathakam
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="space-y-8" ref={reportRef}>
            {/* Report Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={reset}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                  title="Start Over"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="markdown-body prose prose-invert prose-amber max-w-none">
                <Markdown>{report}</Markdown>
              </div>
            </motion.div>

            {/* Chat Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden"
            >
              {/* Decorative element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-indigo-300">Consult the Baba</h2>
                  <p className="text-slate-500 text-sm">Ask about your career, love life, or why your coffee was cold this morning.</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {chatHistory.slice(2).length === 0 && (
                  <div className="text-center py-8 text-slate-500 italic">
                    "Go ahead, don't be shy. The stars already know what you're going to ask anyway."
                  </div>
                )}
                {chatHistory.slice(2).map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-4 rounded-2xl max-w-[85%] shadow-sm transition-all hover:shadow-md",
                      msg.role === 'user' 
                        ? "bg-indigo-600/20 border border-indigo-500/30 ml-auto text-indigo-100 rounded-tr-none" 
                        : "bg-slate-800/80 border border-white/10 mr-auto text-slate-300 rounded-tl-none"
                    )}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-50">
                      {msg.role === 'user' ? 'You' : 'Arvind Baba'}
                    </div>
                    <div className="markdown-body prose prose-invert prose-sm max-w-none">
                      <Markdown>{msg.parts[0].text}</Markdown>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="bg-slate-800/80 border border-white/10 mr-auto p-4 rounded-2xl rounded-tl-none flex items-center gap-3 text-slate-400">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm italic">Baba is checking your vibes...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleAskQuestion} className="flex gap-2 relative z-10">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !question.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20 group"
                >
                  <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2026 Ask Arvind Baba • South Indian Tamil Astrology</p>
          <p className="mt-2 text-slate-600 italic">
            "Planets move, stars shine, but Baba's filter coffee is eternal. Your future is bright, but wear sunglasses just in case."
          </p>
        </footer>
      </main>

      <style>{`
        .color-scheme-dark {
          color-scheme: dark;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .markdown-body h2 {
          color: #fbbf24;
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(251, 191, 36, 0.2);
          padding-bottom: 0.5rem;
        }
        .markdown-body h3 {
          color: #fcd34d;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-body p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .markdown-body ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-body li {
          margin-bottom: 0.5rem;
        }
        .markdown-body pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          font-family: monospace;
          white-space: pre;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #d1d5db;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}
