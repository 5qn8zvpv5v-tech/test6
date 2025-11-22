import React, { useState, useEffect, useRef } from 'react';
import { ThaiChar, CardType, ThaiClass } from '../types';
import { generateSpeech } from '../services/geminiService';

interface FlipCardProps {
  data: ThaiChar;
}

export const FlipCard: React.FC<FlipCardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const getClassColor = (cls: ThaiClass) => {
    switch (cls) {
      case ThaiClass.MID: return 'bg-green-100 text-green-800 border-green-200';
      case ThaiClass.HIGH: return 'bg-red-100 text-red-800 border-red-200';
      case ThaiClass.LOW: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getBadgeColor = (cls: ThaiClass) => {
    switch (cls) {
      case ThaiClass.MID: return 'bg-green-500';
      case ThaiClass.HIGH: return 'bg-red-500';
      case ThaiClass.LOW: return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  // Browser TTS for immediate feedback on the letter name
  const playBrowserAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Gemini TTS for high quality example sentence
  const playGeminiAudio = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Fallback to browser TTS if no audio generated yet or error
      if (!process.env.API_KEY) {
         playBrowserAudio(data.exampleWord);
         setIsPlaying(false);
         return;
      }

      let currentAudioUrl = audioUrl;

      if (!currentAudioUrl) {
        // Generate only if we haven't cached it for this session
        const base64 = await generateSpeech(data.exampleWord);
        if (base64) {
          const binaryString = atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/mp3' });
          currentAudioUrl = URL.createObjectURL(blob);
          setAudioUrl(currentAudioUrl);
        } else {
          // Fallback
           playBrowserAudio(data.exampleWord);
           setIsPlaying(false);
           return;
        }
      }

      if (currentAudioUrl) {
        const audio = new Audio(currentAudioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      }
    } catch (err) {
      console.error(err);
      playBrowserAudio(data.exampleWord); // Last resort
      setIsPlaying(false);
    }
  };

  const handleClick = () => {
    if (!isFlipped) {
      playBrowserAudio(data.char + " ... " + data.name);
    }
    setIsFlipped(!isFlipped);
  };

  // Generate a deterministic image seed based on meaning to keep images consistent
  const imageSeed = data.meaning.replace(/\s/g, ''); 

  return (
    <div 
      className="group h-64 w-full perspective-1000 cursor-pointer"
      onClick={handleClick}
    >
      <div className={`relative h-full w-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Side */}
        <div className={`absolute h-full w-full rounded-2xl shadow-lg border-2 backface-hidden flex flex-col items-center justify-center p-4 bg-white ${getClassColor(data.class)} hover:shadow-xl transition-shadow`}>
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full text-white absolute top-3 right-3 ${getBadgeColor(data.class)}`}>
            {data.class}
          </span>
          <div className="text-8xl font-thai font-bold drop-shadow-md mb-2">
            {data.char}
          </div>
          <div className="text-sm font-medium text-slate-500 mt-4">Tap to Flip</div>
        </div>

        {/* Back Side */}
        <div className={`absolute h-full w-full rounded-2xl shadow-lg border-2 backface-hidden rotate-y-180 overflow-hidden bg-white flex flex-col`}>
           {/* Header */}
           <div className={`p-3 text-center border-b ${getClassColor(data.class)}`}>
              <h3 className="text-xl font-bold font-thai">{data.name}</h3>
              <p className="text-sm opacity-75">{data.phonetic}</p>
           </div>
           
           {/* Content */}
           <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-3 relative">
             <img 
                src={`https://picsum.photos/seed/${imageSeed}/200/120`} 
                alt={data.meaning}
                className="w-full h-24 object-cover rounded-md bg-slate-200"
             />
             <div className="text-center">
                <p className="text-2xl font-thai text-slate-800">{data.exampleWord}</p>
                <p className="text-sm text-slate-500 capitalize">{data.exampleMeaning}</p>
             </div>

             <button 
              onClick={playGeminiAudio}
              disabled={isPlaying}
              className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isPlaying ? (
                 <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
               ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               )}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};
