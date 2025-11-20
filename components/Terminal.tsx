
import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Send } from 'lucide-react';
import { queryKyleAssistant } from '../services/geminiService';
import { playRetroSound } from '../utils/soundEffects';

interface HistoryItem {
  type: 'input' | 'output';
  content: string;
}

export const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', content: 'SystemOS v2.5.0 (Retro Kernel)' },
    { type: 'output', content: 'Welcome to the Admin Console.' },
    { type: 'output', content: 'Type "help" to begin...' },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history]);

  const handleCommand = async (cmd: string) => {
    const lowerCmd = cmd.toLowerCase().trim();
    let response = '';

    switch (lowerCmd) {
      case 'help':
        response = `COMMAND LIST:
  [help]     Show commands
  [clear]    Reset screen
  [whoami]   User info
  [contact]  Get email/phone
  [skills]   List tech stack
  [projects] List projects
  
  >> You can also ask me AI questions!`;
        break;
      case 'whoami':
        response = 'Kyle McClain | Systems Administrator | DevOps Engineer';
        break;
      case 'contact':
        response = 'Email: mcclainkyle7@gmail.com\nPhone: (925) 785-8269';
        break;
      case 'skills':
        response = 'GCP, Azure, Fortinet, PowerShell, Python, SentinelOne, Docker, Kubernetes';
        break;
      case 'projects':
        response = '- Lab Relocation\n- LIS Migration\n- Vuln Mgmt\n- Satellite Office';
        break;
      case 'clear':
        setHistory([]);
        return;
      default:
        setLoading(true);
        response = await queryKyleAssistant(cmd);
        setLoading(false);
        break;
    }

    setHistory(prev => [...prev, { type: 'output', content: response }]);
    if (lowerCmd !== 'clear') {
       playRetroSound('success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    playRetroSound('click');
    setHistory(prev => [...prev, { type: 'input', content: input }]);
    const cmd = input;
    setInput('');
    handleCommand(cmd);
  };

  return (
    <div className="flex flex-col h-full border-4 border-black bg-black font-mono text-sm shadow-hard">
      {/* Retro Title Bar */}
      <div className="bg-gray-300 border-b-4 border-black p-2 flex justify-between items-center select-none">
         <div className="flex gap-1">
            <div className="w-3 h-3 bg-white border border-black"></div>
            <div className="w-3 h-3 bg-white border border-black"></div>
            <div className="w-3 h-3 bg-white border border-black"></div>
         </div>
         <div className="font-bold text-black">C:\ADMIN\CONSOLE.EXE</div>
         <div className="w-4 h-4 bg-gray-400 border border-black"></div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-black text-green-500 font-bold">
        {history.map((item, idx) => (
          <div key={idx} className={`${item.type === 'input' ? 'text-white' : 'text-green-500'}`}>
            <span className="mr-2">{item.type === 'input' ? 'C:\\>' : ''}</span>
            <span className="whitespace-pre-wrap">{item.content}</span>
          </div>
        ))}
        {loading && (
          <div className="text-y2k-yellow animate-pulse">
            Processing...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 bg-gray-900 border-t-2 border-gray-700 flex gap-2">
        <span className="text-green-500 self-center">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 outline-none font-mono"
          placeholder="Enter command..."
          autoFocus
        />
        <button type="submit" className="text-green-500 hover:text-white">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
