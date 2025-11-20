
import React, { useState } from 'react';
import { PROJECTS } from '../constants';
import { FolderGit2, Server, Shield, Cloud, ArrowRight, X, Target, Zap, CheckCircle2, Star, ImageIcon } from 'lucide-react';
import { Project } from '../types';
import { playRetroSound } from '../utils/soundEffects';

export const ProjectDeepDive: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleOpenProject = (p: Project) => {
    playRetroSound('click');
    setActiveProject(p);
  };

  const handleCloseProject = () => {
    playRetroSound('click');
    setActiveProject(null);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Infrastructure': return <Server strokeWidth={2.5} />;
      case 'Security': return <Shield strokeWidth={2.5} />;
      case 'DevOps': return <Cloud strokeWidth={2.5} />;
      default: return <FolderGit2 strokeWidth={2.5} />;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROJECTS.map(project => (
          <div 
            key={project.id} 
            onClick={() => handleOpenProject(project)}
            onMouseEnter={() => playRetroSound('hover')}
            className="bg-white border-2 border-black p-0 shadow-hard hover:shadow-hard-lg transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="bg-y2k-blue border-b-2 border-black p-3 flex justify-between items-center">
               <h3 className="font-display text-xl text-white uppercase truncate pr-2">{project.title}</h3>
               <div className="bg-white border-2 border-black p-1 rounded-full">
                 {getIcon(project.category)}
               </div>
            </div>
            
            <div className="p-6 relative z-10">
               <span className="inline-block bg-y2k-yellow border-2 border-black px-2 py-0.5 text-xs font-bold mb-3 shadow-hard-sm">
                  {project.category.toUpperCase()}
               </span>
               <p className="font-medium text-gray-800 line-clamp-3 mb-4">{project.shortDescription}</p>
               
               <button className="flex items-center gap-2 font-black text-sm uppercase border-b-2 border-black pb-0.5 group-hover:text-y2k-orange transition-colors">
                  Access Data <ArrowRight size={16} strokeWidth={3} />
               </button>
            </div>
            
            {/* Decorative pattern */}
            <div className="absolute bottom-0 right-0 opacity-10 text-9xl font-display pointer-events-none select-none text-black -mb-4 -mr-4">
               #
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-[100] bg-y2k-blue/50 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-5xl bg-white border-4 border-black shadow-hard-lg flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Window Header */}
            <div className="bg-black p-2 flex justify-between items-center shrink-0">
               <div className="text-white font-mono font-bold px-2 flex items-center gap-2">
                  <Star size={16} className="text-y2k-yellow fill-y2k-yellow animate-spin-slow" />
                  PROJECT_FILE: {activeProject.id.toUpperCase()}
               </div>
               <button 
                 onClick={handleCloseProject}
                 className="bg-y2k-orange text-white border-2 border-white hover:bg-red-600 p-1 transition-colors"
               >
                 <X size={20} strokeWidth={3} />
               </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-12 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
               <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b-4 border-black pb-6">
                  <div>
                     <h1 className="text-3xl md:text-5xl font-display mb-2">{activeProject.title}</h1>
                     <p className="text-xl font-bold text-gray-500">{activeProject.shortDescription}</p>
                  </div>
                  <div className="bg-y2k-lime border-2 border-black p-4 shadow-hard transform rotate-2 shrink-0">
                     <div className="text-xs font-black uppercase">Category</div>
                     <div className="text-xl font-display">{activeProject.category}</div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     {/* Sections */}
                     <section>
                        <h3 className="flex items-center gap-2 text-2xl font-display mb-4">
                           <Target strokeWidth={3} className="text-y2k-orange" /> OBJECTIVE
                        </h3>
                        <div className="bg-white border-2 border-black p-6 shadow-hard text-lg font-medium">
                           {activeProject.objective}
                        </div>
                     </section>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                           <h3 className="flex items-center gap-2 text-xl font-display mb-3 text-red-600">
                              <X strokeWidth={4} /> CHALLENGE
                           </h3>
                           <p className="bg-red-50 border-2 border-red-200 p-4 rounded font-medium text-gray-800">
                              {activeProject.challenge}
                           </p>
                        </section>
                        <section>
                           <h3 className="flex items-center gap-2 text-xl font-display mb-3 text-y2k-lime">
                              <Zap strokeWidth={3} fill="currentColor" /> SOLUTION
                           </h3>
                           <p className="bg-lime-50 border-2 border-lime-200 p-4 rounded font-medium text-gray-800">
                              {activeProject.solution}
                           </p>
                        </section>
                     </div>

                     {/* Tech Artifacts / Images Section */}
                     {activeProject.images && activeProject.images.length > 0 && (
                        <section>
                           <h3 className="flex items-center gap-2 text-2xl font-display mb-4">
                              <ImageIcon strokeWidth={3} className="text-y2k-blue" /> ARTIFACTS & TOOLS
                           </h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {activeProject.images.map((img, idx) => (
                                 <div 
                                    key={idx} 
                                    className="bg-white p-2 border-2 border-black shadow-hard-sm hover:rotate-1 hover:scale-105 transition-transform duration-300"
                                    onMouseEnter={() => playRetroSound('hover')}
                                 >
                                    <div className="bg-gray-100 border border-gray-300 mb-2 overflow-hidden h-32 flex items-center justify-center">
                                       <img src={img} alt={`Artifact ${idx}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="font-mono text-xs font-bold text-center text-gray-500 truncate px-1">
                                       FIG_{idx + 1}.SYS
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </section>
                     )}

                     <section>
                        <h3 className="flex items-center gap-2 text-2xl font-display mb-4">
                           <CheckCircle2 strokeWidth={3} className="text-y2k-blue" /> OUTCOME
                        </h3>
                        <div className="bg-y2k-yellow border-2 border-black p-6 shadow-hard text-lg font-bold">
                           {activeProject.outcome}
                        </div>
                     </section>
                  </div>

                  <div className="lg:col-span-1">
                     <div className="bg-gray-100 border-2 border-black p-6 sticky top-6">
                        <h4 className="font-black text-sm uppercase mb-4 border-b-2 border-black pb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                           {activeProject.tech.map(t => (
                              <span key={t} className="w-full text-center border-2 border-black bg-white py-2 font-bold text-sm shadow-hard-sm hover:bg-y2k-lime transition-colors cursor-default">
                                 {t}
                              </span>
                           ))}
                        </div>
                        
                        <div className="mt-8 text-center">
                           <div className="inline-block bg-black text-y2k-green font-mono px-4 py-2 border-2 border-y2k-green font-bold animate-pulse">
                              STATUS: COMPLETE
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
