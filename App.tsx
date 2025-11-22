import React, { useState, useRef, useEffect } from 'react';
import { consonants, vowels } from './data';
import { FlipCard } from './components/FlipCard';
import { ChatMessage } from './types';
import { getTutorResponse } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'consonants' | 'vowels' | 'tutor'>('consonants');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Sawasdee krub! I am your AI Thai Tutor. Ask me about tones, grammar, or specific letters!' }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    const response = await getTutorResponse(messages, input);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsChatLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20 md:pb-0">
      
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-indigo-600 p-2 rounded-lg font-thai text-2xl font-bold">ก</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ThaiMaster AI</h1>
              <p className="text-xs text-indigo-200">Interactive Alphabet & Tutor</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-2">
             <button 
                onClick={() => setActiveTab('consonants')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'consonants' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-indigo-700'}`}
             >
               Consonants (44)
             </button>
             <button 
                onClick={() => setActiveTab('vowels')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'vowels' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-indigo-700'}`}
             >
               Vowels (32)
             </button>
             <button 
                onClick={() => setActiveTab('tutor')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'tutor' ? 'bg-white text-indigo-700 shadow' : 'text-indigo-100 hover:bg-indigo-700'}`}
             >
               AI Tutor
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        
        {/* Content Grid */}
        {(activeTab === 'consonants' || activeTab === 'vowels') && (
          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  {activeTab === 'consonants' ? 'Thai Consonants (พยัญชนะ)' : 'Thai Vowels (สระ)'}
                  <span className="ml-3 text-sm font-normal px-3 py-1 bg-slate-200 rounded-full text-slate-600">
                    {activeTab === 'consonants' ? consonants.length : vowels.length} items
                  </span>
                </h2>
                <p className="text-sm text-slate-500 hidden sm:block">Click cards to flip & hear pronunciation</p>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
               {activeTab === 'consonants' 
                  ? consonants.map((c) => <FlipCard key={c.char} data={c} />)
                  : vowels.map((v) => <FlipCard key={v.char} data={v} />)
               }
             </div>
          </div>
        )}

        {/* AI Tutor Interface */}
        {activeTab === 'tutor' && (
          <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3 text-xl">🎓</div>
                <div>
                  <h3 className="font-bold">Kru AI (Teacher)</h3>
                  <p className="text-xs text-indigo-100">Ask about tones, sentence structure, or culture.</p>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
             </div>

             <div className="p-4 bg-white border-t border-slate-200">
               <div className="flex space-x-2">
                 <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Example: How do I determine the tone of a syllable?"
                    className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={isChatLoading || !input.trim()}
                   className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors"
                 >
                   <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                 </button>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation Bottom Bar */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-2 z-40 pb-safe">
         <button onClick={() => setActiveTab('consonants')} className={`flex flex-col items-center p-2 ${activeTab === 'consonants' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-lg font-thai font-bold">ก</span>
            <span className="text-[10px]">Consonants</span>
         </button>
         <button onClick={() => setActiveTab('vowels')} className={`flex flex-col items-center p-2 ${activeTab === 'vowels' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-lg font-thai font-bold">ะ</span>
            <span className="text-[10px]">Vowels</span>
         </button>
         <button onClick={() => setActiveTab('tutor')} className={`flex flex-col items-center p-2 ${activeTab === 'tutor' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-lg">🎓</span>
            <span className="text-[10px]">Tutor</span>
         </button>
      </div>
    </div>
  );
};

export default App;