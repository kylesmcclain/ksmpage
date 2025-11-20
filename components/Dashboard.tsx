
import React, { useState } from 'react';
import { EXPERIENCES } from '../constants';
import { Server, Shield, Activity, Database, ArrowRight, X, Briefcase } from 'lucide-react';
import { Experience } from '../types';
import { playRetroSound } from '../utils/soundEffects';

export const Dashboard: React.FC = () => {
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  const handleOpenExp = (exp: Experience) => {
    playRetroSound('click');
    setSelectedExp(exp);
  };

  const handleCloseExp = () => {
    playRetroSound('click');
    setSelectedExp(null);
  };

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div 
      className={`bg-white border-2 border-black p-4 shadow-hard transform transition-transform hover:-translate-y-1 hover:shadow-hard-lg cursor-default`}
      onMouseEnter={() => playRetroSound('hover')}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-black text-gray-400 text-xs uppercase">{title}</h3>
        <Icon size={24} className={color} strokeWidth={3} />
      </div>
      <div className="text-3xl font-display mb-1">{value}</div>
      <div className="text-xs font-bold bg-black text-white px-2 py-1 w-fit">{sub}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Experience" 
          value="10 YRS" 
          sub="LEVEL 10 ADMIN" 
          icon={Activity} 
          color="text-y2k-orange" 
        />
        <StatCard 
          title="Security" 
          value="SECURE" 
          sub="FORTINET ACTIVE" 
          icon={Shield} 
          color="text-y2k-lime" 
        />
        <StatCard 
          title="Infrastructure" 
          value="HYBRID" 
          sub="CLOUD + ON-PREM" 
          icon={Server} 
          color="text-y2k-blue" 
        />
        <StatCard 
          title="Scale" 
          value="250+" 
          sub="NODES MANAGED" 
          icon={Database} 
          color="text-y2k-yellow" 
        />
      </div>

      {/* Career Timeline - Game Level Style */}
      <div className="bg-white border-2 border-black p-6 shadow-hard">
        <h2 className="font-display text-3xl mb-8 flex items-center gap-2">
          <span className="text-y2k-orange">#</span> CAREER_LOG
        </h2>
        
        <div className="relative border-l-4 border-black ml-4 md:ml-8 space-y-8 pl-8 md:pl-12">
          {EXPERIENCES.map((exp, index) => (
            <div 
              key={exp.id} 
              className="relative group cursor-pointer"
              onClick={() => handleOpenExp(exp)}
              onMouseEnter={() => playRetroSound('hover')}
            >
              {/* Node on line */}
              <div className="absolute -left-[46px] md:-left-[62px] top-0 w-6 h-6 bg-white border-4 border-black rounded-full group-hover:bg-y2k-lime transition-colors z-10"></div>
              
              <div className="bg-y2k-bg border-2 border-black p-4 shadow-hard-sm group-hover:shadow-hard group-hover:bg-white transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
                  <h3 className="font-display text-xl">{exp.role}</h3>
                  <span className="bg-black text-white text-xs font-mono px-2 py-1">{exp.period}</span>
                </div>
                <div className="font-bold text-y2k-blue mb-2 flex items-center gap-1">
                   <Briefcase size={14} /> {exp.company}
                </div>
                <p className="text-sm font-medium text-gray-600 line-clamp-2">{exp.description[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Pop-up Window Style */}
      {selectedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseExp}>
          <div className="bg-white border-4 border-black shadow-hard-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-y2k-orange border-b-4 border-black p-3 flex justify-between items-center">
               <h2 className="font-display text-white text-xl tracking-wide">{selectedExp.company.toUpperCase()}</h2>
               <button onClick={handleCloseExp} className="bg-white border-2 border-black hover:bg-gray-200 p-1 transition-colors">
                  <X size={20} strokeWidth={3} />
               </button>
            </div>

            <div className="p-6">
               <div className="flex items-baseline gap-4 mb-6">
                  <h3 className="text-2xl font-black">{selectedExp.role}</h3>
                  <span className="font-mono text-sm bg-y2k-lime px-2 py-1 border-2 border-black font-bold">{selectedExp.period}</span>
               </div>

               <div className="space-y-6">
                  <div>
                    <h4 className="font-black text-sm uppercase text-gray-400 mb-2 border-b-2 border-gray-200 pb-1">Objectives</h4>
                    <ul className="space-y-3">
                      {selectedExp.description.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm font-bold text-gray-700">
                          <ArrowRight size={16} className="text-y2k-orange min-w-[16px] mt-1" strokeWidth={3} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-black text-sm uppercase text-gray-400 mb-2 border-b-2 border-gray-200 pb-1">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExp.techStack.map(tech => (
                        <span key={tech} className="px-3 py-1 bg-y2k-blue text-white border-2 border-black text-xs font-bold shadow-hard-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
